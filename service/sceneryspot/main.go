package main

import (
	"os"

	_ "github.com/go-sql-driver/mysql"

	"github.com/go-micro/plugins/v4/registry/consul"
	grpcs "github.com/go-micro/plugins/v4/server/grpc"
	"go-micro.dev/v4"
	"go-micro.dev/v4/logger"
	"go-micro.dev/v4/registry"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"

	"gitlab.com/annoying-orange/shenzhouyinji/service/sceneryspot/config"
	h "gitlab.com/annoying-orange/shenzhouyinji/service/sceneryspot/handler"
	pb "gitlab.com/annoying-orange/shenzhouyinji/service/sceneryspot/proto"
	r "gitlab.com/annoying-orange/shenzhouyinji/service/sceneryspot/repository"
)

var (
	name    = "sceneryspot"
	version = "1.0.0"
)

func main() {
	// Load conigurations
	if err := config.Load(); err != nil {
		logger.Fatal(err)
	}

	// Create service
	var CONSUL_REG_ADDRESS = os.Getenv("CONSUL_REG_ADDRESS")

	srv := micro.NewService(
		micro.Server(grpcs.NewServer()),
		micro.Registry(consul.NewRegistry(registry.Addrs(CONSUL_REG_ADDRESS))),
	)
	opts := []micro.Option{
		micro.Name(name),
		micro.Version(version),
		micro.Address(config.Address()),
	}

	srv.Init(opts...)

	db, _ := openMySql(config.MySql())
	defer func() {
		sqlDB, _ := db.DB()
		sqlDB.Close()
		logger.Info("MySql has been disconnected")
	}()

	// Register handler
	repo := &r.MySqlRepository{Database: db}
	if err := pb.RegisterSceneryspotServiceHandler(srv.Server(), &h.Handler{Repository: repo}); err != nil {
		logger.Fatal(err)
	}

	// Run service
	if err := srv.Run(); err != nil {
		logger.Fatal(err)
	}
}

func openMySql(config config.MySqlConfig) (*gorm.DB, error) {
	db, err := gorm.Open(mysql.Open(config.DataSourceName))
	if err != nil {
		panic(err.Error())
	}

	return db, nil
}
