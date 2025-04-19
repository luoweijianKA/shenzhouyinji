package handler

import (
	"context"
	pb "gitlab.com/annoying-orange/shenzhouyinji/service/management/proto"
	repo "gitlab.com/annoying-orange/shenzhouyinji/service/management/repository"
)

type Handler struct {
	Repository repo.Repository
}

func (h *Handler) CreateCouponBuyGood(ctx context.Context, req *pb.CouponBuyGood, res *pb.MsKeyword) error {
	result, err := h.Repository.CreateCouponBuyGood(ctx, req)

	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) GetTideSpotConfigById(ctx context.Context, req *pb.MsKeyword, res *pb.TideSpotConfig) error {
	result, err := h.Repository.GetTideSpotConfigById(ctx, req)

	if err != nil {
		return err
	}

	res.Id = result.Id
	res.TideSpotId = result.TideSpotId
	res.TideSpotName = result.TideSpotName
	res.CouponName = result.CouponName
	res.CompareWord = result.CompareWord
	res.CouponImgPath = result.CouponImgPath
	res.CompareLogoPath = result.CompareLogoPath
	res.CompareLogoId = result.CompareLogoId
	res.Desc = result.Desc
	res.EffectiveTime = result.EffectiveTime
	res.CouponContent = result.CouponContent
	res.GenerateNum = result.GenerateNum
	res.UseNum = result.UseNum
	res.NotUseNum = result.NotUseNum
	res.MinimumAmount = result.MinimumAmount
	res.DeductionAmount = result.DeductionAmount
	res.UseAmount = result.UseAmount
	res.GuideDesc = result.GuideDesc
	res.GuideVideoPath = result.GuideVideoPath
	res.TideSpotGoodListJson = result.TideSpotGoodListJson
	res.Type = result.Type
	res.Enable = result.Enable
	res.CreateTime = result.CreateTime
	return nil
}

func (h *Handler) UpdateCoupon(ctx context.Context, req *pb.Coupon, res *pb.MsUpdateRes) error {
	result, err := h.Repository.UpdateCoupon(ctx, req)
	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) CreateTideSpotConfig(ctx context.Context, req *pb.TideSpotConfig, res *pb.MsKeyword) error {
	result, err := h.Repository.CreateTideSpotConfig(ctx, req)

	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) GetCouponList(ctx context.Context, req *pb.CouponRequest, res *pb.CouponRes) error {

	result, err := h.Repository.GetCouponList(ctx, req)

	if err != nil {
		return err
	}

	res.Data = result.Data

	return nil
}

func (h *Handler) GetCouponListByPage(ctx context.Context, req *pb.CouponRequest, res *pb.CouponRes) error {

	result, err := h.Repository.GetCouponListByPage(ctx, req)

	if err != nil {
		return err
	}

	res.Data = result.Data
	res.Total = result.Total

	return nil
}

func (h *Handler) GetTideSpotConfig(ctx context.Context, req *pb.MsKeyword, res *pb.TideSpotConfig) error {
	result, err := h.Repository.GetTideSpotConfigById(ctx, req)

	if err != nil {
		return err
	}

	res = result

	return nil
}

func (h *Handler) CreateTideSpotGood(ctx context.Context, req *pb.TideSpotGood, res *pb.MsKeyword) error {
	//TODO implement me
	result, err := h.Repository.CreateTideSpotGood(ctx, req)

	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) CreateTideSpot(ctx context.Context, req *pb.TideSpot, res *pb.MsKeyword) error {
	result, err := h.Repository.CreateTideSpot(ctx, req)

	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) CreateCoupon(ctx context.Context, req *pb.Coupon, res *pb.MsKeyword) error {
	result, err := h.Repository.CreateCoupon(ctx, req)
	if err != nil {
		return err
	}
	res.Value = result.Value
	return nil
}

func (h *Handler) UpdateTideSpot(ctx context.Context, req *pb.TideSpot, res *pb.MsUpdateRes) error {
	result, err := h.Repository.UpdateTideSpot(ctx, req)
	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) GetTideSpotList(ctx context.Context, in *pb.MsKeyword, res *pb.TideSpotRes) error {
	result, err := h.Repository.GetTideSpotList(ctx, in)
	if err != nil {
		return err
	}

	res.Data = result.Data

	return nil
}

func (h *Handler) GetTurtleBackConfig(ctx context.Context, in *pb.MsKeyword, res *pb.TurtleBackConfig) error {
	result, err := h.Repository.GetTurtleBackConfigById(ctx, in)
	if err != nil {
		return err
	}

	res.Id = result.Id
	res.Sort = result.Sort
	res.MenuCode = result.MenuCode
	res.MenuName = result.MenuName
	res.MenuConfigName = result.MenuConfigName
	res.Path = result.Path
	res.Enable = result.Enable
	return nil
}

func (h *Handler) GetTurtleBackMenuList(ctx context.Context, in *pb.MsKeyword, out *pb.TurtleBackMenuRes) error {

	result, err := h.Repository.GetTurtleBackMenuList(ctx, in)
	if err != nil {
		return err
	}

	out.Data = result.Data

	return nil
}

func (h *Handler) GetTurtleBackConfigList(ctx context.Context, in *pb.MsKeyword, out *pb.TurtleBackConfigRes) error {

	result, err := h.Repository.GetTurtleBackConfigList(ctx, in)
	if err != nil {
		return err
	}

	out.Data = result.Data

	return nil
}

func (h *Handler) GetTideSpotConfigList(ctx context.Context, in *pb.TideSpotConfigRequest, out *pb.TideSpotConfigRes) error {

	result, err := h.Repository.GetTideSpotConfigList(ctx, in)
	if err != nil {
		return err
	}

	out.Data = result.Data

	return nil
}

func (h *Handler) UpdateTideSpotConfig(ctx context.Context, in *pb.TideSpotConfig, out *pb.MsUpdateRes) error {

	result, err := h.Repository.UpdateTideSpotConfig(ctx, in)
	if err != nil {
		return err
	}

	out.Value = result.Value

	return nil
}

func (h *Handler) UpdateTurtleBackConfig(ctx context.Context, in *pb.TurtleBackConfig, out *pb.MsUpdateRes) error {

	result, err := h.Repository.UpdateTurtleBackConfig(ctx, in)
	if err != nil {
		return err
	}

	out.Value = result.Value

	return nil
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

func (h *Handler) GetCoupon(ctx context.Context, req *pb.MsKeyword, res *pb.Coupon) error {
	result, err := h.Repository.GetCoupon(ctx, req)
	if err != nil {
		return err
	}

	res.Id = result.Id
	res.Type = result.Type
	res.TideSpotConfigId = result.TideSpotConfigId
	res.TideSpotId = result.TideSpotId
	res.TideSpotName = result.TideSpotName
	res.CouponName = result.CouponName
	res.GenerateWord = result.GenerateWord
	res.GenerateImgPath = result.GenerateImgPath
	res.CreateTime = result.CreateTime
	res.UserWechat = result.UserWechat
	res.UserWechatName = result.UserWechatName
	res.SubmitWord = result.SubmitWord
	res.SubmitImgPath = result.SubmitImgPath
	res.EffectiveTime = result.EffectiveTime
	res.Desc = result.Desc
	res.Use = result.Use
	res.QrCodePath = result.QrCodePath
	res.MinimumAmount = result.MinimumAmount
	res.DeductionAmount = result.DeductionAmount
	res.BuyGoodName = result.BuyGoodName
	res.VerificationWechat = result.VerificationWechat
	res.VerificationWechatName = result.VerificationWechatName
	res.UseTime = result.UseTime
	res.UserPhone = result.UserPhone
	res.SubmitLogoImgPath = result.SubmitLogoImgPath

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
