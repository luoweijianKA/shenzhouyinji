package config

import (
	"fmt"
	"os"

	"github.com/pkg/errors"
	"go-micro.dev/v4/config"
	"go-micro.dev/v4/config/source/env"
)

type Config struct {
	Port  int
	MySql MySqlConfig
}

type MySqlConfig struct {
	DriverName     string
	DataSourceName string
}

var DB_SOURCE = os.Getenv("DB_SOURCE")

var cfg *Config = &Config{
	Port: 5050,
	MySql: MySqlConfig{
		DriverName:     "mysql",
		DataSourceName: DB_SOURCE,
	},
}

func Get() Config {
	return *cfg
}

func Address() string {
	return fmt.Sprintf(":%d", cfg.Port)
}

func MySql() MySqlConfig {
	return cfg.MySql
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
