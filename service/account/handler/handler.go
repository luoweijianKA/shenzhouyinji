package handler

import (
	"context"

	pb "gitlab.com/annoying-orange/shenzhouyinji/service/account/proto"
	r "gitlab.com/annoying-orange/shenzhouyinji/service/account/repository"
)

type Handler struct {
	Repository r.Repository
}

func (h *Handler) CreateAccount(ctx context.Context, req *pb.Account, res *pb.AsKeyword) error {
	result, err := h.Repository.CreateAccount(ctx, req)
	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) UpdateAccount(ctx context.Context, in *pb.Account, out *pb.AsRes) error {
	result, err := h.Repository.UpdateAccount(ctx, in)
	if err != nil {
		return err
	}

	out.Value = result.Value

	return nil
}

func (h *Handler) UpdateProfile(ctx context.Context, req *pb.Profile, res *pb.AsRes) error {
	result, err := h.Repository.UpdateProfile(ctx, req)
	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) GetAccount(ctx context.Context, req *pb.AsKeyword, res *pb.Account) error {
	result, err := h.Repository.GetAccount(ctx, req)
	if err != nil {
		return err
	}

	res.Id = result.Id
	res.LoginId = result.LoginId
	res.Wechat = result.Wechat
	res.WechatName = result.WechatName
	res.WechatAvatar = result.WechatAvatar
	res.Role = result.Role
	res.Status = result.Status
	res.Scopes = result.Scopes
	res.CreateTime = result.CreateTime

	return nil
}

func (h *Handler) GetAccounts(ctx context.Context, in *pb.AccountRequest, out *pb.AccountResponse) error {
	return h.Repository.GetAccounts(ctx, in, out)
}

func (h *Handler) DeleteAccount(ctx context.Context, in *pb.AsKeyword, out *pb.AccountResponse) error {
	return h.Repository.DeleteAccount(ctx, in, out)
}

func (h *Handler) GetProfileByUserID(ctx context.Context, req *pb.AsKeyword, res *pb.Profile) error {
	result, err := h.Repository.GetProfileByUserID(ctx, req)
	if err != nil {
		return err
	}

	res.Id = result.Id
	res.Name = result.Name
	res.Gender = result.Gender
	res.Age = result.Age
	res.Birthday = result.Birthday
	res.Email = result.Email
	res.Phone = result.Phone
	res.City = result.City
	res.Tags = result.Tags
	res.Nric = result.Nric
	res.Authentication = result.Authentication
	res.Profession = result.Profession
	res.GuardianName = result.GuardianName
	res.GuardianNric = result.GuardianNric
	res.GuardianPhone = result.GuardianPhone
	res.CreateTime = result.CreateTime

	return nil
}

func (h *Handler) GetProfileByName(ctx context.Context, req *pb.AsKeyword, res *pb.Profile) error {
	result, err := h.Repository.GetProfileByName(ctx, req)
	if err != nil {
		return err
	}

	res.Id = result.Id
	res.Name = result.Name
	res.Gender = result.Gender
	res.Age = result.Age
	res.Birthday = result.Birthday
	res.Email = result.Email
	res.Phone = result.Phone
	res.City = result.City
	res.Tags = result.Tags
	res.Nric = result.Nric
	res.Authentication = result.Authentication
	res.Profession = result.Profession
	res.GuardianName = result.GuardianName
	res.GuardianNric = result.GuardianNric
	res.GuardianPhone = result.GuardianPhone
	res.CreateTime = result.CreateTime

	return nil
}

func (h *Handler) CreateClaimCode(ctx context.Context, req *pb.ClaimCode, res *pb.AsKeyword) error {
	result, err := h.Repository.CreateClaimCode(ctx, req)
	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) UpdateClaimCode(ctx context.Context, req *pb.ClaimCode, res *pb.AsRes) error {
	result, err := h.Repository.UpdateClaimCode(ctx, req)
	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) GetClaimCodeByUserID(ctx context.Context, req *pb.AsKeyword, res *pb.ClaimCode) error {
	result, err := h.Repository.GetClaimCodeByUserID(ctx, req)
	if err != nil {
		return err
	}

	res.Id = result.Id
	res.UserId = result.UserId
	res.Code = result.Code
	res.Status = result.Status
	res.CreateTime = result.CreateTime

	return nil
}

func (h *Handler) Login(ctx context.Context, req *pb.LoginReq, res *pb.LoginRes) error {
	result, err := h.Repository.Login(ctx, req)
	if err != nil {
		return err
	}

	res.Id = result.Id
	res.LoginId = result.LoginId
	res.Role = result.Role

	return nil
}

func (h *Handler) LoginWithWechat(ctx context.Context, req *pb.WechatReq, res *pb.LoginRes) error {
	result, err := h.Repository.LoginWithWechat(ctx, req)
	if err != nil {
		return err
	}

	res.Id = result.Id
	res.LoginId = result.LoginId
	res.Role = result.Role

	return nil
}

func (h *Handler) UpdatePassword(ctx context.Context, req *pb.PasswordReq, res *pb.AsRes) error {
	result, err := h.Repository.UpdatePassword(ctx, req)
	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) CreateIndivIdentity(ctx context.Context, in *pb.IndivIdentity, out *pb.IndivIdentityResponse) error {
	return h.Repository.CreateIndivIdentity(ctx, in, out)
}

func (h *Handler) GetIndivIdentity(ctx context.Context, in *pb.IndivIdentityRequest, out *pb.IndivIdentityResponse) error {
	return h.Repository.GetIndivIdentity(ctx, in, out)
}

func (h *Handler) GetIndivIdentityAccount(ctx context.Context, in *pb.IndivIdentityAccountRequest, out *pb.IndivIdentityAccountResponse) error {
	return h.Repository.GetIndivIdentityAccount(ctx, in, out)
}

func (h *Handler) DeleteIndivIdentity(ctx context.Context, in *pb.IndivIdentityRequest, out *pb.IndivIdentityResponse) error {
	return h.Repository.DeleteIndivIdentity(ctx, in, out)
}

func (h *Handler) GetUserPoints(ctx context.Context, in *pb.UserPointsRequest, out *pb.UserPointsResponse) error {
	return h.Repository.GetUserPoints(ctx, in, out)
}

func (h *Handler) AddUserPoints(ctx context.Context, in *pb.UserPoints, out *pb.UserPointsResponse) error {
	return h.Repository.AddUserPoints(ctx, in, out)
}

func (h *Handler) GetExportUsers(ctx context.Context, in *pb.ExportUserRequest, out *pb.ExportUserResponse) error {
	return h.Repository.GetExportUsers(ctx, in, out)
}
