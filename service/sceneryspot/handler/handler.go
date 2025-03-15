package handler

import (
	"context"

	pb "gitlab.com/annoying-orange/shenzhouyinji/service/sceneryspot/proto"
	repo "gitlab.com/annoying-orange/shenzhouyinji/service/sceneryspot/repository"
)

type Handler struct {
	Repository repo.Repository
}

// Sceneryspot
func (h *Handler) CreateSceneryspot(ctx context.Context, req *pb.Sceneryspot, res *pb.SsKeyword) error {
	result, err := h.Repository.CreateSceneryspot(ctx, req)
	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) UpdateSceneryspot(ctx context.Context, req *pb.Sceneryspot, res *pb.SsUpdateRes) error {
	result, err := h.Repository.UpdateSceneryspot(ctx, req)
	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) GetSceneryspot(ctx context.Context, req *pb.SsKeyword, res *pb.Sceneryspot) error {
	result, err := h.Repository.GetSceneryspot(ctx, req)
	if err != nil {
		return err
	}

	res.Id = result.Id
	res.Code = result.Code
	res.Name = result.Name
	res.Address = result.Address
	res.Points = result.Points
	res.Images = result.Images
	res.Coordinate = result.Coordinate
	res.ElectricFence = result.ElectricFence
	res.Introduction = result.Introduction
	res.CategoryId = result.CategoryId
	res.PositionTolerance = result.PositionTolerance
	res.PassportLink = result.PassportLink
	res.HealthCodeLink = result.HealthCodeLink
	res.Status = result.Status
	res.CreateTime = result.CreateTime
	res.EnableAward = result.EnableAward

	return nil
}

func (h *Handler) GetSceneryspots(ctx context.Context, req *pb.SsEmptyReq, res *pb.SceneryspotsRes) error {
	result, err := h.Repository.GetSceneryspots(ctx, req)
	if err != nil {
		return err
	}

	res.Data = result.Data

	return nil
}

func (h *Handler) GetSceneryspotsByIDs(ctx context.Context, req *pb.SsKeywords, res *pb.SceneryspotsRes) error {
	result, err := h.Repository.GetSceneryspotsByIDs(ctx, req)
	if err != nil {
		return err
	}

	res.Data = result.Data

	return nil
}

// Stamp
func (h *Handler) CreateStamp(ctx context.Context, req *pb.Stamp, res *pb.SsKeyword) error {
	result, err := h.Repository.CreateStamp(ctx, req)
	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) UpdateStamp(ctx context.Context, req *pb.Stamp, res *pb.SsUpdateRes) error {
	result, err := h.Repository.UpdateStamp(ctx, req)
	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) GetStamp(ctx context.Context, req *pb.SsKeyword, res *pb.Stamp) error {
	result, err := h.Repository.GetStamp(ctx, req)
	if err != nil {
		return err
	}

	res.Id = result.Id
	res.SceneryspotId = result.SceneryspotId
	res.Name = result.Name
	res.Address = result.Address
	res.Coordinate = result.Coordinate
	res.Code = result.Code
	res.Images = result.Images
	res.Status = result.Status
	res.CreateTime = result.CreateTime

	return nil
}

func (h *Handler) GetStampsBySceneryspotID(ctx context.Context, req *pb.SsKeyword, res *pb.StampsRes) error {
	result, err := h.Repository.GetStampsBySceneryspotID(ctx, req)
	if err != nil {
		return err
	}

	res.Data = result.Data

	return nil
}

// ServiceItems
func (h *Handler) CreateServiceItem(ctx context.Context, req *pb.ServiceItem, res *pb.SsKeyword) error {
	result, err := h.Repository.CreateServiceItem(ctx, req)
	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) UpdateServiceItem(ctx context.Context, req *pb.ServiceItem, res *pb.SsUpdateRes) error {
	result, err := h.Repository.UpdateServiceItem(ctx, req)
	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) GetServiceItem(ctx context.Context, req *pb.SsKeyword, res *pb.ServiceItem) error {
	result, err := h.Repository.GetServiceItem(ctx, req)
	if err != nil {
		return err
	}

	res.Id = result.Id
	res.SceneryspotId = result.SceneryspotId
	res.Name = result.Name
	res.CategoryId = result.CategoryId
	res.Address = result.Address
	res.Images = result.Images
	res.Coordinate = result.Coordinate
	res.Wxappid = result.Wxappid
	res.DisplayOrder = result.DisplayOrder
	res.Introduction = result.Introduction
	res.ExpenseInstruction = result.ExpenseInstruction
	res.Status = result.Status

	return nil
}

func (h *Handler) GetServiceItemsBySceneryspotID(ctx context.Context, req *pb.SsKeyword, res *pb.ServiceItemsRes) error {
	result, err := h.Repository.GetServiceItemsBySceneryspotID(ctx, req)
	if err != nil {
		return err
	}

	res.Data = result.Data

	return nil
}

func (h *Handler) GetServiceItemsByCategory(ctx context.Context, req *pb.SsKeywordByCategory, res *pb.ServiceItemsRes) error {
	result, err := h.Repository.GetServiceItemsByCategory(ctx, req)
	if err != nil {
		return err
	}

	res.Data = result.Data

	return nil
}

// UserStamp
func (h *Handler) CreateUserStamp(ctx context.Context, req *pb.UserStamp, res *pb.UserStampsRes) error {
	result, err := h.Repository.CreateUserStamp(ctx, req)
	if err != nil {
		return err
	}

	res.Data = []*pb.UserStamp{result}

	return nil
}

func (h *Handler) UpdateUserStamp(ctx context.Context, in *pb.UserStamp, out *pb.UserStampsRes) error {
	return h.Repository.UpdateUserStamp(ctx, in, out)
}

func (h *Handler) GetUserStampByUserID(ctx context.Context, req *pb.SsKeyword, res *pb.UserStampsRes) error {
	result, err := h.Repository.GetUserStampByUserID(ctx, req)
	if err != nil {
		return err
	}

	res.Data = result.Data

	return nil
}

func (h *Handler) GetUserStampByStampID(ctx context.Context, req *pb.SsKeyword, res *pb.UserStampsRes) error {
	result, err := h.Repository.GetUserStampByStampID(ctx, req)
	if err != nil {
		return err
	}

	res.Data = result.Data

	return nil
}

func (h *Handler) CreateUserSceneryspot(ctx context.Context, in *pb.UserSceneryspot, out *pb.UserSceneryspotResponse) error {
	return h.Repository.CreateUserSceneryspot(ctx, in, out)
}

func (h *Handler) GetUserSceneryspots(ctx context.Context, in *pb.UserSceneryspotRequest, out *pb.UserSceneryspotResponse) error {
	return h.Repository.GetUserSceneryspots(ctx, in, out)
}

func (h *Handler) GetUserStamp(ctx context.Context, in *pb.UserStampRequest, out *pb.UserStampsRes) error {
	return h.Repository.GetUserStamp(ctx, in, out)
}

func (h *Handler) UpdateUserStampRecord(ctx context.Context, req *pb.UserStampRecordReq, res *pb.SsUpdateRes) error {

	result, err := h.Repository.UpdateUserStampRecord(ctx, req)

	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) GetUserStampPointsRecord(ctx context.Context, req *pb.UserStampPointsRecordReq, res *pb.UserStampPointsRecordRes) error {

	result, err := h.Repository.GetUserStampPointsRecord(ctx, req)

	if err != nil {
		return err
	}

	res.Data = result.Data

	return nil
}
