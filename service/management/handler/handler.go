package handler

import (
	"context"

	pb "gitlab.com/annoying-orange/shenzhouyinji/service/management/proto"
	repo "gitlab.com/annoying-orange/shenzhouyinji/service/management/repository"
)

type Handler struct {
	Repository repo.Repository
}

// Config
func (h *Handler) GetConfigs(ctx context.Context, in *pb.ConfigRequest, out *pb.ConfigResponse) error {
	return h.Repository.GetConfigs(ctx, in, out)
}

func (h *Handler) UpdateConfigs(ctx context.Context, in *pb.ConfigRequest, out *pb.ConfigResponse) error {
	return h.Repository.UpdateConfigs(ctx, in, out)
}

// Category
func (h *Handler) CreateCategory(ctx context.Context, req *pb.Category, res *pb.MsKeyword) error {
	result, err := h.Repository.CreateCategory(ctx, req)

	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) UpdateCategory(ctx context.Context, req *pb.Category, res *pb.MsUpdateRes) error {
	result, err := h.Repository.UpdateCategory(ctx, req)

	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) GetCategoryByID(ctx context.Context, req *pb.MsKeyword, res *pb.Category) error {
	result, err := h.Repository.GetCategoryByID(ctx, req)
	if err != nil {
		return err
	}

	res.Id = result.Id
	res.Name = result.Name
	res.ParentId = result.ParentId
	res.HasSubclass = result.HasSubclass
	res.Status = result.Status
	res.Sort = result.Sort

	return nil
}

func (h *Handler) GetCategoryByName(ctx context.Context, req *pb.MsKeyword, res *pb.Category) error {
	result, err := h.Repository.GetCategoryByName(ctx, req)
	if err != nil {
		return err
	}

	res.Id = result.Id
	res.Name = result.Name
	res.ParentId = result.ParentId
	res.HasSubclass = result.HasSubclass
	res.Status = result.Status
	res.Sort = result.Sort

	return nil
}

func (h *Handler) GetCategoryByParentID(ctx context.Context, req *pb.MsKeyword, res *pb.CategoriesRes) error {
	result, err := h.Repository.GetCategoryByParentID(ctx, req)
	if err != nil {
		return err
	}

	res.Data = result.Data

	return nil
}

func (h *Handler) GetTopCategory(ctx context.Context, req *pb.MsEmptyReq, res *pb.CategoriesRes) error {
	result, err := h.Repository.GetTopCategory(ctx, req)
	if err != nil {
		return err
	}

	res.Data = result.Data

	return nil
}

// Tag
func (h *Handler) CreateTag(ctx context.Context, req *pb.Tag, res *pb.MsKeyword) error {
	result, err := h.Repository.CreateTag(ctx, req)

	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) UpdateTag(ctx context.Context, req *pb.Tag, res *pb.MsUpdateRes) error {
	result, err := h.Repository.UpdateTag(ctx, req)

	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) GetTagByID(ctx context.Context, req *pb.MsKeyword, res *pb.Tag) error {
	result, err := h.Repository.GetTagByID(ctx, req)
	if err != nil {
		return err
	}

	res.Id = result.Id
	res.Name = result.Name
	res.CategoryId = result.CategoryId
	res.Status = result.Status

	return nil
}

func (h *Handler) GetTagByCategoryID(ctx context.Context, req *pb.MsKeyword, res *pb.TagsRes) error {
	result, err := h.Repository.GetTagByCategoryID(ctx, req)
	if err != nil {
		return err
	}

	res.Data = result.Data

	return nil
}

func (h *Handler) GetAreaInfoByParentID(ctx context.Context, req *pb.AreaInfoRequest, res *pb.AreaInfosRes) error {
	result, err := h.Repository.GetAreaInfoByParentID(ctx, req)
	if err != nil {
		return err
	}

	res.Data = result.Data

	return nil
}

func (h *Handler) CreateAuditing(ctx context.Context, in *pb.Auditing, out *pb.AuditingResponse) error {
	return h.Repository.CreateAuditing(ctx, in, out)
}

func (h *Handler) GetAuditings(ctx context.Context, in *pb.AuditingRequest, out *pb.AuditingResponse) error {
	return h.Repository.GetAuditings(ctx, in, out)
}

func (h *Handler) RestoreSceneryspot(ctx context.Context, in *pb.RestoreRequest, out *pb.RestoreResponse) error {
	return h.Repository.RestoreSceneryspot(ctx, in, out)
}

func (h *Handler) RestoreEvent(ctx context.Context, in *pb.RestoreRequest, out *pb.RestoreResponse) error {
	return h.Repository.RestoreEvent(ctx, in, out)
}

func (h *Handler) RestoreUser(ctx context.Context, in *pb.RestoreRequest, out *pb.RestoreResponse) error {
	return h.Repository.RestoreUser(ctx, in, out)
}

func (h *Handler) RestoreUserEvent(ctx context.Context, in *pb.RestoreRequest, out *pb.RestoreResponse) error {
	return h.Repository.RestoreUserEvent(ctx, in, out)
}

func (h *Handler) RestoreTask(ctx context.Context, in *pb.RestoreRequest, out *pb.RestoreResponse) error {
	return h.Repository.RestoreTask(ctx, in, out)
}

func (h *Handler) RestoreBadge(ctx context.Context, in *pb.RestoreRequest, out *pb.RestoreResponse) error {
	return h.Repository.RestoreBadge(ctx, in, out)
}

func (h *Handler) RestoreLike(ctx context.Context, in *pb.RestoreRequest, out *pb.RestoreResponse) error {
	return h.Repository.RestoreLike(ctx, in, out)
}

func (h *Handler) RestorePoints(ctx context.Context, in *pb.RestoreRequest, out *pb.RestoreResponse) error {
	return h.Repository.RestorePoints(ctx, in, out)
}

func (h *Handler) RestoreConversation(ctx context.Context, in *pb.RestoreRequest, out *pb.RestoreResponse) error {
	return h.Repository.RestoreConversation(ctx, in, out)
}
