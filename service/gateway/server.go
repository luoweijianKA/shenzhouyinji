package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"gateway/config"
	"gateway/graph/auth"
	"gateway/graph/directives"
	"gateway/graph/generated"
	"gateway/graph/resolver"
	"gateway/upload"
	"gateway/weixin"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
	mgrpc "github.com/go-micro/plugins/v4/client/grpc"
	consul "github.com/go-micro/plugins/v4/registry/consul"
	"go-micro.dev/v4"
	"go-micro.dev/v4/logger"
	"go-micro.dev/v4/registry"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"

	aPB "gitlab.com/annoying-orange/shenzhouyinji/service/account/proto"
	ePB "gitlab.com/annoying-orange/shenzhouyinji/service/event/proto"
	mPB "gitlab.com/annoying-orange/shenzhouyinji/service/management/proto"
	msgPB "gitlab.com/annoying-orange/shenzhouyinji/service/message/proto"
	sPB "gitlab.com/annoying-orange/shenzhouyinji/service/sceneryspot/proto"
	tPB "gitlab.com/annoying-orange/shenzhouyinji/service/task/proto"
)

const (
	name    = "gateway"
	version = "1.0.0"
)

type ClientServer struct {
	AccountService     aPB.AccountService
	SceneryspotService sPB.SceneryspotService
	TaskService        tPB.TaskService
	MessageService     msgPB.MessagesService
	ManagementService  mPB.ManagementService
	EventService       ePB.EventService
}

func main() {
	// Load conigurations
	if err := config.Load(); err != nil {
		logger.Fatal(err)
	}

	// Create service client
	var CONSUL_REG_ADDRESS = os.Getenv("CONSUL_REG_ADDRESS")

	cs := micro.NewService(
		micro.Client(mgrpc.NewClient()),
		micro.Registry(consul.NewRegistry(registry.Addrs(CONSUL_REG_ADDRESS))),
	)
	opts := []micro.Option{
		micro.Name(name),
		micro.Version(version),
	}

	cs.Init(opts...)

	cfg, client := config.Get(), cs.Client()
	cs1 := &ClientServer{
		AccountService:     aPB.NewAccountService(cfg.AccountService, client),
		SceneryspotService: sPB.NewSceneryspotService(cfg.SceneryspotService, client),
		TaskService:        tPB.NewTaskService(cfg.TaskService, client),
		MessageService:     msgPB.NewMessagesService(cfg.MessageService, client),
		ManagementService:  mPB.NewManagementService(cfg.ManagementService, client),
		EventService:       ePB.NewEventService(cfg.EventService, client),
	}

	go func() {
		if err := cs.Run(); err != nil {
			logger.Fatal(err)
		}
	}()

	db := newDB(config.Mongo())
	defer func() {
		if err := db.Client().Disconnect(context.Background()); err != nil {
			panic(err)
		}
		logger.Info("MongoDB has been disconnected")
	}()

	WECHAT_APPID := os.Getenv("WECHAT_APPID")
	WECHAT_SECRET := os.Getenv("WECHAT_SECRET")
	wx := weixin.NewAPI(WECHAT_APPID, WECHAT_SECRET)

	router := chi.NewRouter()
	router.Use(auth.Middleware(db))
	router.Use(cors.Handler(
		cors.Options{
			AllowedOrigins:   []string{"*"},
			AllowCredentials: true,
			MaxAge:           300,
		},
	))

	resolver := resolver.NewResolver(db, wx, cs1.AccountService, cs1.SceneryspotService, cs1.TaskService, cs1.ManagementService, cs1.MessageService, cs1.EventService)

	genConfig := generated.Config{Resolvers: resolver}
	genConfig.Directives.Auth = directives.Auth
	genConfig.Directives.Root = directives.Root
	genConfig.Directives.HasRole = directives.HasRole
	genConfig.Directives.Auditing = directives.Auditing
	srv := handler.NewDefaultServer(generated.NewExecutableSchema(genConfig))

	router.Handle("/query", srv)
	router.Handle("/playground", playground.Handler("GraphQL playground", "/query"))
	router.Handle("/upload", upload.Handler())

	log.Printf("connect to http://localhost:%d/ for GraphQL playground", cfg.Port)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", cfg.Port), router))
}

func newDB(config config.MongoConfig) *mongo.Database {
	fmt.Println(config)
	uri := config.URI
	if len(uri) == 0 {
		uri = "mongodb://127.0.0.1:27017"
	}
	database := config.Database
	if len(database) == 0 {
		database = "test"
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(uri))

	if err != nil {
		logger.Fatal(err)
	}

	// check connect to mongodb
	if err := client.Ping(ctx, readpref.Primary()); err != nil {
		logger.Fatal(err)
	}

	return client.Database(database)
}
