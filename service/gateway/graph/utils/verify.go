package utils

import (
	"context"
	"errors"
	"gateway/graph/auth"
	"gateway/graph/model"
)

func VerifyPermissions(ctx context.Context, object_id string) error {
	uc := auth.ForContext(ctx)

	if uc.User.Id != object_id && uc.User.Role != string(model.RoleAdmin) && uc.User.Role != string(model.RoleRoot) {
		return errors.New("access denied")
	}

	return nil
}
