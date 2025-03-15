package config

import (
	"os"

	"github.com/pkg/errors"
	"go-micro.dev/v4/config"
	"go-micro.dev/v4/config/source/env"
)

type Config struct {
	Port               int
	Mongo              MongoConfig
	AccountService     string
	SceneryspotService string
	TaskService        string
	MessageService     string
	ManagementService  string
	EventService       string
}

type MongoConfig struct {
	URI      string
	Database string
}

var DB_URI = os.Getenv("DB_URI")
var DB_NAME = os.Getenv("DB_NAME")

var cfg *Config = &Config{
	Port: 8080,
	Mongo: MongoConfig{
		URI:      DB_URI,
		Database: DB_NAME,
	},
	AccountService:     "account",
	SceneryspotService: "sceneryspot",
	TaskService:        "task",
	MessageService:     "message",
	ManagementService:  "management",
	EventService:       "event",
}

func Get() Config {
	return *cfg
}

func Mongo() MongoConfig {
	return cfg.Mongo
}

func Load() error {
	configor, err := config.NewConfig(config.WithSource(env.NewSource()))
	if err != nil {
		return errors.Wrap(err, "configor.New")
	}
	if err := configor.Load(); err != nil {
		return errors.Wrap(err, "configor.Load")
	}
	if err := configor.Scan(cfg); err != nil {
		return errors.Wrap(err, "configor.Scan")
	}
	return nil
}
