package repository

import (
	"context"
	"errors"
	"strings"
	"time"

	uuid "github.com/satori/go.uuid"
	pb "gitlab.com/annoying-orange/shenzhouyinji/service/management/proto"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

const StatusDelete = 4

type Repository interface {
	GetConfigs(ctx context.Context, in *pb.ConfigRequest, out *pb.ConfigResponse) error
	UpdateConfigs(ctx context.Context, in *pb.ConfigRequest, out *pb.ConfigResponse) error

	CreateCategory(ctx context.Context, item *pb.Category) (*pb.MsKeyword, error)
	UpdateCategory(ctx context.Context, item *pb.Category) (*pb.MsUpdateRes, error)
	GetCategoryByID(ctx context.Context, req *pb.MsKeyword) (*pb.Category, error)
	GetCategoryByName(ctx context.Context, req *pb.MsKeyword) (*pb.Category, error)
	GetCategoryByParentID(ctx context.Context, req *pb.MsKeyword) (*pb.CategoriesRes, error)
	GetTopCategory(ctx context.Context, req *pb.MsEmptyReq) (*pb.CategoriesRes, error)

	CreateTag(ctx context.Context, item *pb.Tag) (*pb.MsKeyword, error)
	UpdateTag(ctx context.Context, item *pb.Tag) (*pb.MsUpdateRes, error)
	GetTagByID(ctx context.Context, req *pb.MsKeyword) (*pb.Tag, error)
	GetTagByCategoryID(ctx context.Context, req *pb.MsKeyword) (*pb.TagsRes, error)

	GetAreaInfoByParentID(ctx context.Context, req *pb.AreaInfoRequest) (*pb.AreaInfosRes, error)
	GetTurtleBackMenuList(ctx context.Context, req *pb.MsKeyword) (*pb.TurtleBackMenuRes, error)

	CreateTideSpot(ctx context.Context, req *pb.TideSpot) (*pb.MsKeyword, error)
	UpdateTideSpot(ctx context.Context, req *pb.TideSpot) (*pb.MsUpdateRes, error)
	GetTideSpotList(ctx context.Context, req *pb.MsKeyword) (*pb.TideSpotRes, error)

	CreateCoupon(ctx context.Context, item *pb.Coupon) (*pb.MsKeyword, error)
	UpdateCoupon(ctx context.Context, item *pb.Coupon) (*pb.MsUpdateRes, error)
	GetCouponList(ctx context.Context, item *pb.CouponRequest) (*pb.CouponRes, error)
	GetCouponListByPage(ctx context.Context, req *pb.CouponRequest) (*pb.CouponRes, error)
	GetCoupon(ctx context.Context, req *pb.MsKeyword) (*pb.Coupon, error)

	CreateTideSpotConfig(ctx context.Context, req *pb.TideSpotConfig) (*pb.MsKeyword, error)
	GetTideSpotConfigList(ctx context.Context, req *pb.TideSpotConfigRequest) (*pb.TideSpotConfigRes, error)
	UpdateTideSpotConfig(ctx context.Context, req *pb.TideSpotConfig) (*pb.MsUpdateRes, error)
	GetTideSpotConfigById(ctx context.Context, req *pb.MsKeyword) (*pb.TideSpotConfig, error)
	GetTideSpotConfigCount(ctx context.Context, req *pb.TideSpotConfigRequest) (*pb.TideSpotConfigCountRes, error)

	CreateTideSpotGood(ctx context.Context, req *pb.TideSpotGood) (*pb.MsKeyword, error)
	CreateCouponBuyGood(ctx context.Context, req *pb.CouponBuyGood) (*pb.MsKeyword, error)

	GetTurtleBackConfigList(ctx context.Context, req *pb.MsKeyword) (*pb.TurtleBackConfigRes, error)
	GetTurtleBackConfigById(ctx context.Context, req *pb.MsKeyword) (*pb.TurtleBackConfig, error)
	UpdateTurtleBackConfig(ctx context.Context, req *pb.TurtleBackConfig) (*pb.MsUpdateRes, error)

	CreateAuditing(ctx context.Context, in *pb.Auditing, out *pb.AuditingResponse) error
	GetAuditings(ctx context.Context, in *pb.AuditingRequest, out *pb.AuditingResponse) error

	RestoreSceneryspot(ctx context.Context, in *pb.RestoreRequest, out *pb.RestoreResponse) error
	RestoreEvent(ctx context.Context, in *pb.RestoreRequest, out *pb.RestoreResponse) error
	RestoreUser(ctx context.Context, in *pb.RestoreRequest, out *pb.RestoreResponse) error
	RestoreUserEvent(ctx context.Context, in *pb.RestoreRequest, out *pb.RestoreResponse) error
	RestoreTask(ctx context.Context, in *pb.RestoreRequest, out *pb.RestoreResponse) error
	RestoreBadge(ctx context.Context, in *pb.RestoreRequest, out *pb.RestoreResponse) error
	RestoreLike(ctx context.Context, in *pb.RestoreRequest, out *pb.RestoreResponse) error
	RestorePoints(ctx context.Context, in *pb.RestoreRequest, out *pb.RestoreResponse) error
	RestoreConversation(ctx context.Context, in *pb.RestoreRequest, out *pb.RestoreResponse) error
}

type MySqlRepository struct {
	Database *gorm.DB
}

// Config
func (r *MySqlRepository) GetConfigs(ctx context.Context, in *pb.ConfigRequest, out *pb.ConfigResponse) error {
	keys := []string{}
	for _, v := range in.Data {
		if v != nil {
			keys = append(keys, v.Key)
		}
	}

	conds := map[string]interface{}{}
	if len(keys) > 0 {
		conds["key"] = keys
	}

	if err := r.Database.Table("sys_config").Find(&out.Data, conds).Error; err != nil {
		return err
	}

	return nil
}

func (r *MySqlRepository) UpdateConfigs(ctx context.Context, in *pb.ConfigRequest, out *pb.ConfigResponse) error {
	if err := r.Database.Table("sys_config").
		Clauses(clause.OnConflict{
			Columns:   []clause.Column{{Name: "key"}},
			DoUpdates: clause.AssignmentColumns([]string{"value"}),
		}).
		Create(in.Data).
		Error; err != nil {
		return err
	}

	out.Data = in.Data

	return nil
}

// Category
func (r *MySqlRepository) CreateCategory(ctx context.Context, item *pb.Category) (*pb.MsKeyword, error) {
	item.Id = uuid.NewV4().String()

	if len(item.ParentId) != 0 {
		var category pb.Category

		if err := r.Database.Table("sys_category").First(&category).Error; err != nil {
			return nil, errors.New("parent class does not exist")
		}

		if !category.HasSubclass {
			category.HasSubclass = true
			r.Database.Table("sys_category").Save(&category)
		}
	}

	if err := r.Database.Table("sys_category").Create(&item).Error; err != nil {
		return nil, err
	}
	return &pb.MsKeyword{Value: item.Id}, nil
}

func (r *MySqlRepository) UpdateCategory(ctx context.Context, item *pb.Category) (*pb.MsUpdateRes, error) {
	if item.Status == StatusDelete {
		if err := r.Database.Table("sys_category").Delete(&pb.Category{}, "id = ?", item.Id).Error; err != nil {
			return nil, err
		}
		return &pb.MsUpdateRes{Value: true}, nil
	}

	if err := r.Database.Table("sys_category").Where("id = ?", item.Id).Updates(pb.Category{
		Name:        item.Name,
		ParentId:    item.ParentId,
		HasSubclass: item.HasSubclass,
		Status:      item.Status,
		Sort:        item.Sort,
	}).Error; err != nil {
		return nil, err
	}

	return &pb.MsUpdateRes{Value: true}, nil
}

func (r *MySqlRepository) GetCategoryByID(ctx context.Context, req *pb.MsKeyword) (*pb.Category, error) {
	result := new(pb.Category)
	result.Id = req.Value

	if err := r.Database.Table("sys_category").First(&result).Error; err != nil {
		return nil, err
	}

	return result, nil
}

func (r *MySqlRepository) GetCategoryByName(ctx context.Context, req *pb.MsKeyword) (*pb.Category, error) {
	result := new(pb.Category)

	if err := r.Database.Table("sys_category").Where("name = ?", req.Value).First(&result).Error; err != nil {
		return nil, err
	}

	return result, nil
}

func (r *MySqlRepository) GetTurtleBackConfigById(ctx context.Context, req *pb.MsKeyword) (*pb.TurtleBackConfig, error) {
	result := new(pb.TurtleBackConfig)

	if err := r.Database.Table("turtle_back_config").Where("id = ?", req.Value).First(&result).Error; err != nil {
		return nil, err
	}

	return result, nil
}

func (r *MySqlRepository) GetCategoryByParentID(ctx context.Context, req *pb.MsKeyword) (*pb.CategoriesRes, error) {
	result := new(pb.CategoriesRes)
	result.Data = make([]*pb.Category, 0)

	if err := r.Database.Table("sys_category").Where("parent_id = ?", req.Value).Find(&result.Data).Error; err != nil {
		return nil, err
	}

	return result, nil
}

func (r *MySqlRepository) GetTopCategory(ctx context.Context, req *pb.MsEmptyReq) (*pb.CategoriesRes, error) {
	result := new(pb.CategoriesRes)
	result.Data = make([]*pb.Category, 0)

	if err := r.Database.Table("sys_category").Where("parent_id = '' OR parent_id IS NULL").Find(&result.Data).Error; err != nil {
		return nil, err
	}

	return result, nil
}

// Coupon
func (r *MySqlRepository) CreateCoupon(ctx context.Context, item *pb.Coupon) (*pb.MsKeyword, error) {
	item.Id = uuid.NewV4().String()

	if err := r.Database.Table("coupon").Create(&item).Error; err != nil {
		return nil, err
	}
	return &pb.MsKeyword{Value: item.Id}, nil
}

func (r *MySqlRepository) GetCoupon(ctx context.Context, req *pb.MsKeyword) (*pb.Coupon, error) {
	result := new(pb.Coupon)
	result.Id = req.Value

	if err := r.Database.Table("coupon").First(&result).Error; err != nil {
		return nil, err
	}

	return result, nil

}

func (r *MySqlRepository) UpdateCoupon(ctx context.Context, item *pb.Coupon) (*pb.MsUpdateRes, error) {
	if err := r.Database.Table("coupon").Where("id = ?", item.Id).Updates(&item).Error; err != nil {
		return nil, err
	}
	return &pb.MsUpdateRes{Value: true}, nil
}

func (r *MySqlRepository) GetCouponList(ctx context.Context, req *pb.CouponRequest) (*pb.CouponRes, error) {
	result := new(pb.CouponRes)
	result.Data = make([]*pb.Coupon, 0)
	db := r.Database.Table("coupon")
	if len(req.Type) > 0 {
		db = db.Where("type = ?", req.Type)
	}
	if len(req.TideSpotName) > 0 {
		db = db.Where("tide_spot_ame like ?", "%"+req.TideSpotName+"%")
	}
	if len(req.GenerateRule) > 0 {
		db = db.Where("compare_word like ?", "%"+req.GenerateRule+"%")
	}
	if len(req.BuyGoodName) > 0 {
		db = db.Where("buy_good_name like ?", "%"+req.BuyGoodName+"%")
	}
	if len(req.BuyGoodName) > 0 {
		db = db.Where("buy_good_name like ?", "%"+req.BuyGoodName+"%")
	}
	if len(req.VerificationWechatName) > 0 {
		db = db.Where("verification_wechat_name like ?", "%"+req.VerificationWechatName+"%")
	}
	if len(req.UserWechatName) > 0 {
		db = db.Where("user_wechat_name like ?", "%"+req.UserWechatName+"%")
	}
	if len(req.UserPhone) > 0 {
		db = db.Where("user_phone like ?", "%"+req.UserPhone+"%")
	}
	if req.UseTimeStart > 0 {
		db = db.Where("use_time >= ?", req.UseTimeStart)
	}
	if req.UseTimeEnd > 0 {
		db = db.Where("use_time <= ?", req.UseTimeEnd)
	}
	if len(req.UserWechat) > 0 {
		db = db.Where("user_wechat = ?", req.UserWechat)
	}
	if req.StateCode == "Used" {
		db.Where("use = 1")
	}
	if req.StateCode == "Expired" {
		db.Where("effective_time <= ?", time.Now().Unix())
	}
	if req.StateCode == "Normal" {
		db.Where("effective_time > ?", time.Now().Unix())
		db.Where("use = 0")
	}
	// 未兑换包括已过期和未使用
	if req.StateCode == "NotUse" {
		db.Where("effective_time <= ? or use = 0", time.Now().Unix())
	}

	if err := db.Order("create_time DESC ").Debug().Find(&result.Data).Error; err != nil {
		return nil, err
	}

	return result, nil
}

func (r *MySqlRepository) GetCouponListByPage(ctx context.Context, req *pb.CouponRequest) (*pb.CouponRes, error) {
	result := new(pb.CouponRes)
	result.Data = make([]*pb.Coupon, 0)
	offset := (req.PageIndex - 1) * req.PageSize

	db := r.Database.Table("coupon")
	if len(req.Type) > 0 {
		db = db.Where("type = ?", req.Type)
	}
	if len(req.TideSpotName) > 0 {
		db = db.Where("tide_spot_ame like ?", "%"+req.TideSpotName+"%")
	}
	if len(req.GenerateRule) > 0 {
		db = db.Where("compare_word like ?", "%"+req.GenerateRule+"%")
	}
	if len(req.BuyGoodName) > 0 {
		db = db.Where("buy_good_name like ?", "%"+req.BuyGoodName+"%")
	}
	if len(req.BuyGoodName) > 0 {
		db = db.Where("buy_good_name like ?", "%"+req.BuyGoodName+"%")
	}
	if len(req.VerificationWechatName) > 0 {
		db = db.Where("verification_wechat_name like ?", "%"+req.VerificationWechatName+"%")
	}
	if len(req.UserWechatName) > 0 {
		db = db.Where("user_wechat_name like ?", "%"+req.UserWechatName+"%")
	}
	if len(req.UserPhone) > 0 {
		db = db.Where("user_phone like ?", "%"+req.UserPhone+"%")
	}
	if req.UseTimeStart > 0 {
		db = db.Where("use_time >= ?", req.UseTimeStart)
	}
	if req.UseTimeEnd > 0 {
		db = db.Where("use_time <= ?", req.UseTimeEnd)
	}
	if len(req.UserWechat) > 0 {
		db = db.Where("user_wechat = ?", req.UserWechat)
	}
	if req.StateCode == "Used" {
		db.Where("use = 1")
	}
	if req.StateCode == "Expired" {
		db.Where("effective_time <= ?", time.Now().Unix())
	}
	if req.StateCode == "Normal" {
		db.Where("effective_time > ?", time.Now().Unix())
		db.Where("use = 0")
	}
	// 未兑换包括已过期和未使用
	if req.StateCode == "NotUse" {
		db.Where("effective_time <= ? or use = 0", time.Now().Unix())
	}

	db.Count(&result.Total)

	if err := db.Limit(int(req.PageSize)).Offset(int(offset)).Order("create_time DESC ").Debug().Find(&result.Data).Error; err != nil {
		return nil, err
	}

	return result, nil
}

// AreaInfo
func (r *MySqlRepository) CreateAreaInfo(ctx context.Context, item *pb.AreaInfo) (*pb.MsKeyword, error) {
	var areaInfo pb.AreaInfo

	if err := r.Database.Table("sys_area_info").Where("id = ?", item.Id).First(&areaInfo).Error; err != nil {
		return nil, errors.New("areaInfo does not exist")
	}

	item.Id = uuid.NewV4().String()

	if err := r.Database.Table("sys_area_info").Create(&item).Error; err != nil {
		return nil, err
	}
	return &pb.MsKeyword{Value: item.Id}, nil
}

func (r *MySqlRepository) UpdateAreaInfo(ctx context.Context, item *pb.AreaInfo) (*pb.MsUpdateRes, error) {
	if item.Status == StatusDelete {
		if err := r.Database.Table("sys_area_info").Delete(&pb.AreaInfo{}, "id = ?", item.Id).Error; err != nil {
			return nil, err
		}
		return &pb.MsUpdateRes{Value: true}, nil
	}

	if err := r.Database.Table("sys_area_info").Where("id = ?", item.Id).Updates(pb.AreaInfo{
		Name:     item.Name,
		ParentId: item.ParentId,
		Type:     item.Type,
		Status:   item.Status,
	}).Error; err != nil {
		return nil, err
	}

	return &pb.MsUpdateRes{Value: true}, nil
}

func (r *MySqlRepository) GetAreaInfoByID(ctx context.Context, req *pb.MsKeyword) (*pb.AreaInfo, error) {
	result := new(pb.AreaInfo)
	result.Id = req.Value

	if err := r.Database.Table("sys_area_info").First(&result).Error; err != nil {
		return nil, err
	}

	return result, nil
}

func (r *MySqlRepository) GetAreaInfoByParentID(ctx context.Context, req *pb.AreaInfoRequest) (*pb.AreaInfosRes, error) {
	result := new(pb.AreaInfosRes)
	result.Data = make([]*pb.AreaInfo, 0)
	db := r.Database.Table("sys_area_info")
	if len(req.ParentId) > 0 {
		db = db.Where("parent_id = ?", req.ParentId)
	}
	if len(req.Type) > 0 {
		db = db.Where("type = ?", req.Type)
	}
	if err := db.Order("sort ASC ").Find(&result.Data).Error; err != nil {
		return nil, err
	}

	return result, nil
}

// TideSpot
func (r *MySqlRepository) CreateTideSpot(ctx context.Context, item *pb.TideSpot) (*pb.MsKeyword, error) {

	item.Id = uuid.NewV4().String()
	item.CreateTime = int32(time.Now().Unix())
	item.UpdateTime = item.CreateTime

	item.Status = 1
	if err := r.Database.Table("tide_spot").Create(&item).Error; err != nil {
		return nil, err
	}
	return &pb.MsKeyword{Value: item.Id}, nil
}
func (r *MySqlRepository) UpdateTideSpot(ctx context.Context, item *pb.TideSpot) (*pb.MsUpdateRes, error) {
	if item.Status == StatusDelete {
		if err := r.Database.Table("tide_spot").Delete(&pb.TideSpot{}, "id = ?", item.Id).Error; err != nil {
			return nil, err
		}
		return &pb.MsUpdateRes{Value: true}, nil
	}

	if err := r.Database.Table("tide_spot").Where("id = ?", item.Id).Updates(pb.TideSpot{
		Name:              item.Name,
		PositionTolerance: item.PositionTolerance,
		ElectricFence:     item.ElectricFence,
		UpdateTime:        int32(time.Now().Unix()),
		Status:            item.Status,
	}).Error; err != nil {
		return nil, err
	}

	return &pb.MsUpdateRes{Value: true}, nil
}
func (r *MySqlRepository) GetTideSpotList(ctx context.Context, req *pb.MsKeyword) (*pb.TideSpotRes, error) {
	result := new(pb.TideSpotRes)
	result.Data = make([]*pb.TideSpot, 0)
	db := r.Database.Table("tide_spot")

	if len(req.Value) > 0 {
		db = db.Where("name = ?", req.Value)
	}

	if err := db.Order("create_time DESC").Find(&result.Data).Error; err != nil {
		return nil, err
	}

	return result, nil
}

// TideSpotGood
func (r *MySqlRepository) CreateTideSpotGood(ctx context.Context, item *pb.TideSpotGood) (*pb.MsKeyword, error) {
	item.Id = uuid.NewV4().String()

	if err := r.Database.Table("tide_spot_good").Create(&item).Error; err != nil {
		return nil, err
	}
	return &pb.MsKeyword{Value: item.Id}, nil
}

// CouponBuyGood
func (r *MySqlRepository) CreateCouponBuyGood(ctx context.Context, item *pb.CouponBuyGood) (*pb.MsKeyword, error) {
	item.Id = uuid.NewV4().String()

	if err := r.Database.Table("coupon_buy_good").Create(&item).Error; err != nil {
		return nil, err
	}
	return &pb.MsKeyword{Value: item.Id}, nil
}

// TideSpotConfig
func (r *MySqlRepository) CreateTideSpotConfig(ctx context.Context, item *pb.TideSpotConfig) (*pb.MsKeyword, error) {

	item.Id = uuid.NewV4().String()
	item.CreateTime = int32(time.Now().Unix())
	item.Enable = true
	if err := r.Database.Table("tide_spot_config").Create(&item).Error; err != nil {
		return nil, err
	}
	return &pb.MsKeyword{Value: item.Id}, nil
}

func (r *MySqlRepository) GetTideSpotConfigCount(ctx context.Context, req *pb.TideSpotConfigRequest) (*pb.TideSpotConfigCountRes, error) {
	result := new(pb.TideSpotConfigCountRes)
	result.TotalGenerateNum = 0
	result.TotalUseNum = 0
	result.TotalNotUseNum = 0
	result.TotalUseAmount = 0
	db := r.Database.Table("tide_spot_config").Select(" sum(generate_num) as total_generate_num ,sum(use_num) as total_use_num,sum(not_use_num) as total_not_use_num,sum(use_amount) as  total_use_amount")
	if len(req.Type) > 0 {
		db.Where("type = ?", req.Type)
	}
	if err := db.Find(&result).Error; err != nil {
		return nil, err
	}
	return result, nil

}

func (r *MySqlRepository) UpdateTideSpotConfig(ctx context.Context, item *pb.TideSpotConfig) (*pb.MsUpdateRes, error) {

	if err := r.Database.Table("tide_spot_config").Where("id = ?", item.Id).Updates(&item).Error; err != nil {
		return nil, err
	}
	if !item.Enable {
		r.Database.Table("tide_spot_config").Where("id = ?", item.Id).Select("enable").Updates(pb.TideSpotConfig{Enable: false})
	}

	return &pb.MsUpdateRes{Value: true}, nil
}

func (r *MySqlRepository) GetTideSpotConfigList(ctx context.Context, req *pb.TideSpotConfigRequest) (*pb.TideSpotConfigRes, error) {
	result := new(pb.TideSpotConfigRes)
	result.Data = make([]*pb.TideSpotConfig, 0)
	db := r.Database.Table("tide_spot_config")

	if len(req.TideSpotId) > 0 {
		db.Where("tide_spot_id = ?", req.TideSpotId)
	}
	if len(req.Type) > 0 {
		db.Where("type = ?", req.Type)
	}
	if req.Enable {
		db.Where("enable = 1")
		db.Where("effective_time > ?", time.Now().Unix())
	}
	if err := db.Order(" create_time DESC").Find(&result.Data).Error; err != nil {
		return nil, err
	}

	return result, nil
}

func (r *MySqlRepository) GetTideSpotConfigById(ctx context.Context, req *pb.MsKeyword) (*pb.TideSpotConfig, error) {
	result := new(pb.TideSpotConfig)
	result.Id = req.Value

	if err := r.Database.Table("tide_spot_config").First(&result).Error; err != nil {
		return nil, err
	}

	return result, nil
}

// Tag
func (r *MySqlRepository) CreateTag(ctx context.Context, item *pb.Tag) (*pb.MsKeyword, error) {
	var category pb.Category

	if err := r.Database.Table("sys_category").Where("id = ?", item.CategoryId).First(&category).Error; err != nil {
		return nil, errors.New("category does not exist")
	}

	item.Id = uuid.NewV4().String()

	if err := r.Database.Table("sys_tag").Create(&item).Error; err != nil {
		return nil, err
	}
	return &pb.MsKeyword{Value: item.Id}, nil
}

func (r *MySqlRepository) UpdateTag(ctx context.Context, item *pb.Tag) (*pb.MsUpdateRes, error) {
	if item.Status == StatusDelete {
		if err := r.Database.Table("sys_tag").Delete(&pb.Category{}, "id = ?", item.Id).Error; err != nil {
			return nil, err
		}
		return &pb.MsUpdateRes{Value: true}, nil
	}

	if err := r.Database.Table("sys_tag").Where("id = ?", item.Id).Updates(pb.Tag{
		Name:       item.Name,
		CategoryId: item.CategoryId,
		Status:     item.Status,
	}).Error; err != nil {
		return nil, err
	}

	return &pb.MsUpdateRes{Value: true}, nil
}

func (r *MySqlRepository) GetTagByID(ctx context.Context, req *pb.MsKeyword) (*pb.Tag, error) {
	result := new(pb.Tag)
	result.Id = req.Value

	if err := r.Database.Table("sys_tag").First(&result).Error; err != nil {
		return nil, err
	}

	return result, nil
}

func (r *MySqlRepository) GetTagByCategoryID(ctx context.Context, req *pb.MsKeyword) (*pb.TagsRes, error) {
	result := new(pb.TagsRes)
	result.Data = make([]*pb.Tag, 0)

	if err := r.Database.Table("sys_tag").Where("category_id = ?", req.Value).Find(&result.Data).Error; err != nil {
		return nil, err
	}

	return result, nil
}

// TurtleBackMenu
func (r *MySqlRepository) GetTurtleBackMenuList(ctx context.Context, req *pb.MsKeyword) (*pb.TurtleBackMenuRes, error) {
	result := new(pb.TurtleBackMenuRes)
	result.Data = make([]*pb.TurtleBackMenu, 0)

	if err := r.Database.Table("turtle_back_menu").Find(&result.Data).Error; err != nil {
		return nil, err
	}

	return result, nil
}

// TurtleBackConfig
func (r *MySqlRepository) GetTurtleBackConfigList(ctx context.Context, req *pb.MsKeyword) (*pb.TurtleBackConfigRes, error) {
	result := new(pb.TurtleBackConfigRes)
	result.Data = make([]*pb.TurtleBackConfig, 0)

	if err := r.Database.Table("turtle_back_config").Order(" sort ASC ").Find(&result.Data).Error; err != nil {
		return nil, err
	}

	return result, nil
}

func (r *MySqlRepository) UpdateTurtleBackConfig(ctx context.Context, item *pb.TurtleBackConfig) (*pb.MsUpdateRes, error) {
	//values := map[string]interface{}{
	//	"sort":             item.Sort,
	//	"menu_config_name": item.MenuConfigName,
	//	"menu_name":        item.MenuName,
	//	"Path":             item.Path,
	//	"menu_code":        item.MenuCode,
	//	"enable":           item.Enable,
	//	"icon_path":        item.IconPath,
	//}
	if err := r.Database.Table("turtle_back_config").Where("id = ?", item.Id).Updates(&item).Error; err != nil {
		return nil, err
	}
	if !item.Enable {
		r.Database.Table("turtle_back_config").Where("id = ?", item.Id).Select("enable").Updates(pb.TurtleBackConfig{Enable: false})
	}
	return &pb.MsUpdateRes{Value: true}, nil
}

// Auditing
func (r *MySqlRepository) CreateAuditing(ctx context.Context, in *pb.Auditing, out *pb.AuditingResponse) error {
	db := r.Database.Table("sys_auditing")
	if len(in.Id) == 0 {
		in.Id = uuid.NewV4().String()
	}
	if err := db.Create(in).Error; err != nil {
		return err
	}

	out.Data = []*pb.Auditing{in}

	return nil
}

func (r *MySqlRepository) GetAuditings(ctx context.Context, in *pb.AuditingRequest, out *pb.AuditingResponse) error {
	db := r.Database.Table("sys_auditing")
	if len(in.Code) > 0 {
		db = db.Where("code = ?", in.Code)
	}
	if len(in.CreatedBy) > 0 {
		db = db.Where("created_by = ?", in.CreatedBy)
	}
	if in.StartTime > 0 && in.EndTime > 0 {
		db = db.Where("created_time BETWEEN ? AND ?", in.StartTime, in.EndTime)
	}

	if err := db.Order("created_time DESC").Find(&out.Data).Error; err != nil {
		return err
	}

	return nil
}

func (r *MySqlRepository) RestoreSceneryspot(ctx context.Context, in *pb.RestoreRequest, out *pb.RestoreResponse) error {
	db := r.Database
	if err := db.Exec("CALL restore_sceneryspot(?)", strings.Join(in.Values, ",")).Error; err != nil {
		return err
	}
	return nil
}

func (r *MySqlRepository) RestoreEvent(ctx context.Context, in *pb.RestoreRequest, out *pb.RestoreResponse) error {
	db := r.Database
	if err := db.Exec("CALL restore_event(?)", strings.Join(in.Values, ",")).Error; err != nil {
		return err
	}
	return nil
}

func (r *MySqlRepository) RestoreUser(ctx context.Context, in *pb.RestoreRequest, out *pb.RestoreResponse) error {
	db := r.Database
	if err := db.Exec("CALL restore_user(?)", strings.Join(in.Values, ",")).Error; err != nil {
		return err
	}
	return nil
}

func (r *MySqlRepository) RestoreUserEvent(ctx context.Context, in *pb.RestoreRequest, out *pb.RestoreResponse) error {
	db := r.Database
	if err := db.Exec("CALL restore_user_event(?, ?)", in.UserId, strings.Join(in.Values, ",")).Error; err != nil {
		return err
	}
	return nil
}

func (r *MySqlRepository) RestoreTask(ctx context.Context, in *pb.RestoreRequest, out *pb.RestoreResponse) error {
	db := r.Database
	if err := db.Exec("CALL restore_task(?)", strings.Join(in.Values, ",")).Error; err != nil {
		return err
	}
	return nil
}

func (r *MySqlRepository) RestoreBadge(ctx context.Context, in *pb.RestoreRequest, out *pb.RestoreResponse) error {
	db := r.Database
	if err := db.Exec("CALL restore_badge(?)", strings.Join(in.Values, ",")).Error; err != nil {
		return err
	}
	return nil
}

func (r *MySqlRepository) RestoreLike(ctx context.Context, in *pb.RestoreRequest, out *pb.RestoreResponse) error {
	db := r.Database
	if err := db.Exec("CALL restore_like(?)", strings.Join(in.Values, ",")).Error; err != nil {
		return err
	}
	return nil
}

func (r *MySqlRepository) RestorePoints(ctx context.Context, in *pb.RestoreRequest, out *pb.RestoreResponse) error {
	db := r.Database
	if err := db.Exec("CALL restore_points(?)", strings.Join(in.Values, ",")).Error; err != nil {
		return err
	}
	return nil
}

func (r *MySqlRepository) RestoreConversation(ctx context.Context, in *pb.RestoreRequest, out *pb.RestoreResponse) error {
	db := r.Database
	if err := db.Exec("CALL restore_conversation(?)", strings.Join(in.Values, ",")).Error; err != nil {
		return err
	}
	return nil
}
