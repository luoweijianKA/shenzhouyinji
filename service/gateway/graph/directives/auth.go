package directives

import (
	"context"
	"gateway/graph/auth"

	"github.com/99designs/gqlgen/graphql"
	"github.com/vektah/gqlparser/gqlerror"
)

func Auth(ctx context.Context, obj interface{}, next graphql.Resolver) (interface{}, error) {
	// fmt.Println("Auth", obj)
	uc := auth.ForContext(ctx)
	if len(uc.Token) == 0 {
		return nil, &gqlerror.Error{
			Message: "Access Denied",
		}
	}

	return next(ctx)
}

func HasRole(ctx context.Context, obj interface{}, next graphql.Resolver) (interface{}, error) {
	uc := auth.ForContext(ctx)

	if uc.User.Role != "ADMIN" && uc.User.Role != "ROOT" {
		return nil, &gqlerror.Error{
			Message: "Permissions Denied",
		}
	}

	return next(ctx)
}

func Root(ctx context.Context, obj interface{}, next graphql.Resolver) (interface{}, error) {
	uc := auth.ForContext(ctx)

	if uc.User.Role != "ROOT" {
		return nil, &gqlerror.Error{
			Message: "Permissions Denied",
		}
	}

	return next(ctx)
}
