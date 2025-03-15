package directives

import (
	"context"
	"encoding/json"
	"fmt"
	"gateway/graph/auth"
	"gateway/graph/model"

	"github.com/99designs/gqlgen/graphql"
)

func Auditing(ctx context.Context, obj interface{}, next graphql.Resolver, code model.AuditingCode) (interface{}, error) {
	uc := auth.ForContext(ctx)
	fmt.Printf("uc: %s\n", toJson(uc))
	fmt.Printf("obj: %s\n", toJson(obj))
	// fmt.Println(args)
	fmt.Printf("%v\n", next)
	res, err := next(ctx)
	fmt.Printf("res: %s\n", toJson(res))
	fmt.Printf("err: %s\n", toJson(err))

	if code == model.AuditingCodeLogin {
		login := obj.(map[string]interface{})
		fmt.Println(login["input"])
	}

	return res, err
}

func toJson(v any) string {
	if v == nil {
		return fmt.Sprintf("%v", v)
	}
	bytes, err := json.Marshal(v)
	if err != nil {
		return err.Error()
	}
	return string(bytes)
}
