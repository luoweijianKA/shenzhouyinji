package repository

import (
	"context"
	"time"

	uuid "github.com/satori/go.uuid"
	mPB "gitlab.com/annoying-orange/shenzhouyinji/service/message/proto"
	pb "gitlab.com/annoying-orange/shenzhouyinji/service/sceneryspot/proto"
	"gorm.io/gorm"
)

const StatusDelete = 4

type Repository interface {
	CreateStamp(ctx context.Context, item *pb.Stamp) (*pb.SsKeyword, error)
	UpdateStamp(ctx context.Context, item *pb.Stamp) (*pb.SsUpdateRes, error)
	GetStamp(ctx context.Context, req *pb.SsKeyword) (*pb.Stamp, error)
	GetStampsBySceneryspotID(ctx context.Context, req *pb.SsKeyword) (*pb.StampsRes, error)

	CreateUserStamp(ctx context.Context, item *pb.UserStamp) (*pb.UserStamp, error)
	UpdateUserStamp(ctx context.Context, in *pb.UserStamp, out *pb.UserStampsRes) error
	GetUserStampByUserID(ctx context.Context, req *pb.SsKeyword) (*pb.UserStampsRes, error)
	GetUserStampByStampID(ctx context.Context, req *pb.SsKeyword) (*pb.UserStampsRes, error)

	CreateServiceItem(ctx context.Context, item *pb.ServiceItem) (*pb.SsKeyword, error)
	UpdateServiceItem(ctx context.Context, item *pb.ServiceItem) (*pb.SsUpdateRes, error)
	GetServiceItem(ctx context.Context, req *pb.SsKeyword) (*pb.ServiceItem, error)
	GetServiceItemsBySceneryspotID(ctx context.Context, req *pb.SsKeyword) (*pb.ServiceItemsRes, error)
	GetServiceItemsByCategory(ctx context.Context, req *pb.SsKeywordByCategory) (*pb.ServiceItemsRes, error)

	CreateSceneryspot(ctx context.Context, item *pb.Sceneryspot) (*pb.SsKeyword, error)
	UpdateSceneryspot(ctx context.Context, item *pb.Sceneryspot) (*pb.SsUpdateRes, error)
	GetSceneryspot(ctx context.Context, req *pb.SsKeyword) (*pb.Sceneryspot, error)
	GetSceneryspots(ctx context.Context, req *pb.SsEmptyReq) (*pb.SceneryspotsRes, error)
	GetSceneryspotsByIDs(ctx context.Context, req *pb.SsKeywords) (*pb.SceneryspotsRes, error)

	CreateUserSceneryspot(ctx context.Context, in *pb.UserSceneryspot, out *pb.UserSceneryspotResponse) error
	GetUserSceneryspots(ctx context.Context, in *pb.UserSceneryspotRequest, out *pb.UserSceneryspotResponse) error

	GetUserStamp(ctx context.Context, in *pb.UserStampRequest, out *pb.UserStampsRes) error
	UpdateUserStampRecord(ctx context.Context, in *pb.UserStampRecordReq) (*pb.SsUpdateRes, error)

	GetUserStampPointsRecord(ctx context.Context, in *pb.UserStampPointsRecordReq) (*pb.UserStampPointsRecordRes, error)
}

type MySqlRepository struct {
	Database *gorm.DB
}

type UserInfo struct {
	userId string `gorm:"id"`
	name   string `gorm:"wechat_name"`
	avatar string `gorm:"wechat_avatar"`
}

// Sceneryspot
func (r *MySqlRepository) CreateSceneryspot(ctx context.Context, item *pb.Sceneryspot) (*pb.SsKeyword, error) {
	item.Id = uuid.NewV4().String()
	item.CreateTime = int32(time.Now().Unix())

	if err := r.Database.Table("scenery_spot").Create(&item).Error; err != nil {
		return nil, err
	}

	return &pb.SsKeyword{Value: item.Id}, nil
}

func (r *MySqlRepository) UpdateSceneryspot(ctx context.Context, item *pb.Sceneryspot) (*pb.SsUpdateRes, error) {
	if item.Status == StatusDelete {
		if err := r.Database.Table("scenery_spot").Delete(&pb.Sceneryspot{}, "id = ?", item.Id).Error; err != nil {
			return nil, err
		}
		return &pb.SsUpdateRes{Value: true}, nil
	}

	values := map[string]interface{}{
		"code":               item.Code,
		"name":               item.Name,
		"address":            item.Address,
		"points":             item.Points,
		"images":             item.Images,
		"coordinate":         item.Coordinate,
		"electric_fence":     item.ElectricFence,
		"introduction":       item.Introduction,
		"category_id":        item.CategoryId,
		"position_tolerance": item.PositionTolerance,
		"passport_link":      item.PassportLink,
		"health_code_link":   item.HealthCodeLink,
		"status":             item.Status,
		"enable_award":       item.EnableAward,
	}

	if err := r.Database.Table("scenery_spot").Where("id = ?", item.Id).Updates(values).Error; err != nil {
		return nil, err
	}

	return &pb.SsUpdateRes{Value: true}, nil
}

func (r *MySqlRepository) GetSceneryspot(ctx context.Context, req *pb.SsKeyword) (*pb.Sceneryspot, error) {
	result := new(pb.Sceneryspot)
	result.Id = req.Value

	if err := r.Database.Table("scenery_spot").First(&result).Error; err != nil {
		return nil, err
	}

	return result, nil
}

func (r *MySqlRepository) GetSceneryspots(ctx context.Context, req *pb.SsEmptyReq) (*pb.SceneryspotsRes, error) {
	result := new(pb.SceneryspotsRes)
	result.Data = make([]*pb.Sceneryspot, 0)

	if err := r.Database.Table("scenery_spot").Order("code").Find(&result.Data).Error; err != nil {
		return nil, err
	}

	return result, nil
}

func (r *MySqlRepository) GetSceneryspotsByIDs(ctx context.Context, req *pb.SsKeywords) (*pb.SceneryspotsRes, error) {
	result := new(pb.SceneryspotsRes)
	result.Data = make([]*pb.Sceneryspot, 0)

	if err := r.Database.Table("scenery_spot").Where("id IN ?", req.Value).Find(&result.Data).Error; err != nil {
		return nil, err
	}

	return result, nil
}

// Stamp
func (r *MySqlRepository) CreateStamp(ctx context.Context, item *pb.Stamp) (*pb.SsKeyword, error) {
	item.Id = uuid.NewV4().String()
	item.CreateTime = int32(time.Now().Unix())

	if err := r.Database.Table("stamp").Create(&item).Error; err != nil {
		return nil, err
	}

	return &pb.SsKeyword{Value: item.Id}, nil
}

func (r *MySqlRepository) UpdateStamp(ctx context.Context, item *pb.Stamp) (*pb.SsUpdateRes, error) {
	if err := r.Database.Table("stamp").Where("id = ?", item.Id).Updates(pb.Stamp{
		Name:       item.Name,
		Address:    item.Address,
		Coordinate: item.Coordinate,
		Code:       item.Code,
		Images:     item.Images,
		Status:     item.Status,
	}).Error; err != nil {
		return nil, err
	}

	return &pb.SsUpdateRes{Value: true}, nil
}

func (r *MySqlRepository) GetStamp(ctx context.Context, req *pb.SsKeyword) (*pb.Stamp, error) {
	result := new(pb.Stamp)
	result.Id = req.Value

	if err := r.Database.Table("stamp").First(&result).Error; err != nil {
		return nil, err
	}

	return result, nil
}

func (r *MySqlRepository) GetStampsBySceneryspotID(ctx context.Context, req *pb.SsKeyword) (*pb.StampsRes, error) {
	result := new(pb.StampsRes)
	result.Data = make([]*pb.Stamp, 0)

	if err := r.Database.Table("stamp").Where("sceneryspot_id = ?", req.Value).Find(&result.Data).Error; err != nil {
		return nil, err
	}

	return result, nil
}

// ServiceItem
func (r *MySqlRepository) CreateServiceItem(ctx context.Context, item *pb.ServiceItem) (*pb.SsKeyword, error) {
	item.Id = uuid.NewV4().String()

	if err := r.Database.Table("scenery_spot_service").Create(&item).Error; err != nil {
		return nil, err
	}
	return &pb.SsKeyword{Value: item.Id}, nil
}

func (r *MySqlRepository) UpdateServiceItem(ctx context.Context, item *pb.ServiceItem) (*pb.SsUpdateRes, error) {
	if item.Status == StatusDelete {
		if err := r.Database.Table("scenery_spot_service").Delete(&pb.ServiceItem{}, "id = ?", item.Id).Error; err != nil {
			return nil, err
		}
		return &pb.SsUpdateRes{Value: true}, nil
	}

	if err := r.Database.Table("scenery_spot_service").Where("id = ?", item.Id).Updates(pb.ServiceItem{
		Name:               item.Name,
		CategoryId:         item.CategoryId,
		Address:            item.Address,
		Images:             item.Images,
		Coordinate:         item.Coordinate,
		Wxappid:            item.Wxappid,
		DisplayOrder:       item.DisplayOrder,
		Introduction:       item.Introduction,
		ExpenseInstruction: item.ExpenseInstruction,
		Status:             item.Status,
	}).Error; err != nil {
		return nil, err
	}

	return &pb.SsUpdateRes{Value: true}, nil
}

func (r *MySqlRepository) GetServiceItem(ctx context.Context, req *pb.SsKeyword) (*pb.ServiceItem, error) {
	result := new(pb.ServiceItem)
	result.Id = req.Value

	if err := r.Database.Table("scenery_spot_service").First(&result).Error; err != nil {
		return nil, err
	}

	return result, nil
}

func (r *MySqlRepository) GetServiceItemsBySceneryspotID(ctx context.Context, req *pb.SsKeyword) (*pb.ServiceItemsRes, error) {
	result := new(pb.ServiceItemsRes)
	result.Data = make([]*pb.ServiceItem, 0)

	if err := r.Database.Table("scenery_spot_service").Where("sceneryspot_id = ?", req.Value).Find(&result.Data).Error; err != nil {
		return nil, err
	}

	return result, nil
}

func (r *MySqlRepository) GetServiceItemsByCategory(ctx context.Context, req *pb.SsKeywordByCategory) (*pb.ServiceItemsRes, error) {
	result := new(pb.ServiceItemsRes)
	result.Data = make([]*pb.ServiceItem, 0)

	if err := r.Database.Table("scenery_spot_service").Where("sceneryspot_id = ? AND category_id = ?", req.SceneryspotID, req.CategoryID).Find(&result.Data).Error; err != nil {
		return nil, err
	}

	return result, nil
}

// UserStamp
func (r *MySqlRepository) CreateUserStamp(ctx context.Context, item *pb.UserStamp) (*pb.UserStamp, error) {
	item.CreateTime = int32(time.Now().Unix())
	if err := r.Database.Table("user_stamp").Create(&item).Error; err != nil {
		return nil, err
	}

	return item, nil
}

func (r *MySqlRepository) UpdateUserStamp(ctx context.Context, in *pb.UserStamp, out *pb.UserStampsRes) error {
	db := r.Database.Table("user_stamp")
	if err := db.Where(
		"user_id=? AND event_id=? AND sceneryspot_id=?",
		in.UserId,
		in.EventId,
		in.SceneryspotId,
	).Updates(&in).Error; err != nil {
		return err
	}
	if err := db.Find(&out.Data, &in).Error; err != nil {
		return err
	}

	return nil
}

func (r *MySqlRepository) GetUserStampByUserID(ctx context.Context, req *pb.SsKeyword) (*pb.UserStampsRes, error) {
	result := new(pb.UserStampsRes)
	result.Data = make([]*pb.UserStamp, 0)

	if err := r.Database.Table("user_stamp").Where("user_id = ?", req.Value).Find(&result.Data).Error; err != nil {
		return nil, err
	}

	return result, nil
}

func (r *MySqlRepository) GetUserStampByStampID(ctx context.Context, req *pb.SsKeyword) (*pb.UserStampsRes, error) {
	result := new(pb.UserStampsRes)
	result.Data = make([]*pb.UserStamp, 0)

	if err := r.Database.Table("user_stamp").Where("stamp_id = ?", req.Value).Find(&result.Data).Error; err != nil {
		return nil, err
	}

	return result, nil
}

func (r *MySqlRepository) CreateUserSceneryspot(ctx context.Context, in *pb.UserSceneryspot, out *pb.UserSceneryspotResponse) error {
	if in.CreateTime == 0 {
		in.CreateTime = int32(time.Now().Unix())
	}
	if err := r.Database.Table("user_scenery_spot").Create(&in).Error; err != nil {
		return err
	}
	if err := r.Database.Table("scenery_spot").Where("id = ?", in.ScenerySpotId).Find(&out.Data).Error; err != nil {
		return err
	}

	return nil
}

func (r *MySqlRepository) GetUserSceneryspots(ctx context.Context, in *pb.UserSceneryspotRequest, out *pb.UserSceneryspotResponse) error {
	db := r.Database.
		Select(`
			s.id,
			s.name,
			s.address,
			s.points,
			s.images,
			s.coordinate,
			s.electric_fence,
			s.introduction,
			s.category_id,
			s.position_tolerance,
			s.passport_link,
			s.health_code_link,
			s.status,
			s.create_time,
			s.code
		`).
		Table("scenery_spot s").
		Joins("INNER JOIN user_stamp u ON s.id = u.sceneryspot_id").
		Where("u.user_id = ? AND u.status = 1", in.UserId)
	if len(in.EventId) > 0 {
		db = db.Where("u.event_id = ?", in.EventId)
	}
	if len(in.SceneryspotId) > 0 {
		db = db.Where("u.user_stamp = ?", in.SceneryspotId)
	}
	if err := db.Order("u.create_time DESC").Find(&out.Data).Error; err != nil {
		return err
	}

	return nil
}

func (r *MySqlRepository) GetUserStamp(ctx context.Context, in *pb.UserStampRequest, out *pb.UserStampsRes) error {
	if err := r.Database.Table("user_stamp").
		Where(&pb.UserStamp{UserId: in.UserId, EventId: in.EventId, SceneryspotId: in.SceneryspotId}).
		Find(&out.Data).Error; err != nil {
		return err
	}

	return nil
}

func (r *MySqlRepository) UpdateUserStampRecord(ctx context.Context, in *pb.UserStampRecordReq) (*pb.SsUpdateRes, error) {

	actionUser, _ := getUserInfo(r, in.ActionUserId)
	item := new(pb.UserStamp)
	if err := r.Database.Table("user_stamp").Where("user_id = ? AND event_id = ? AND sceneryspot_id = ?", in.UserId, in.EventId, in.SceneryspotId).First(&item).Error; err != nil {
		return nil, err
	}

	switch in.ActionType {
	case "Like":
		item.LikeCount += 1
	case "Unlike":
		item.LikeCount -= 1
		if item.LikeCount < 0 {
			item.LikeCount = 0
		}

	case "Share":
		item.ShareCount += 1
	case "View":
		item.ViewCount += 1
	}

	r.Database.Table("user_stamp").Where("user_id = ? AND event_id = ? AND sceneryspot_id = ?", item.UserId, item.EventId, item.SceneryspotId).Save(&item)

	updateUserStampPointsRecord(r, in.UserId, in.EventId, in.SceneryspotId, in.ActionUserId, in.ActionType, actionUser.name)
	addUserStampRecord(r, in.UserId, in.EventId, in.SceneryspotId, in.ActionUserId, in.ActionType)

	return &pb.SsUpdateRes{Value: true}, nil
}

func getUserInfo(r *MySqlRepository, userId string) (*UserInfo, error) {

	result := make(map[string]interface{})

	if err := r.Database.Raw("SELECT id as userId, wechat_name as name, wechat_avatar as avatar FROM user WHERE id = ?", userId).First(&result).Error; err != nil {
		return nil, err
	}

	user := new(UserInfo)
	user.name = result["name"].(string)
	user.userId = result["userId"].(string)
	user.avatar = result["avatar"].(string)

	return user, nil
}

func addUserStampRecord(r *MySqlRepository, userId string, eventId string, sceneryspotId string, actionUserId string, actionType string) error {
	item := new(pb.UserStampRecord)
	item.Id = uuid.NewV4().String()
	item.UserId = userId
	item.EventId = eventId
	item.SceneryspotId = sceneryspotId
	item.ActionUserId = actionUserId
	item.ActionType = actionType
	item.Time = int32(time.Now().Unix())

	if err := r.Database.Table("user_stamp_record").Create(&item).Error; err != nil {
		return err
	}

	return nil
}

func updateUserStampPointsRecord(r *MySqlRepository, userId string, eventId string, sceneryspotId string, actionUserId string, actionType string, actionUserName string) error {
	item := new(pb.UserStampPointsRecord)

	if err := r.Database.Table("user_stamp_points_record").Where("user_id = ? AND event_id = ? AND sceneryspot_id = ? AND action_user_id = ?", userId, eventId, sceneryspotId, actionUserId).First(&item).Error; err != nil {
		item.Id = uuid.NewV4().String()
		item.UserId = userId
		item.EventId = eventId
		item.SceneryspotId = sceneryspotId
		item.ActionUserId = actionUserId
		item.Like = 0
		item.Share = 0
		item.View = 0
		if err := r.Database.Table("user_stamp_points_record").Create(&item).Error; err != nil {
			return err
		}
	}

	switch actionType {
	case "Like":
		if item.Like == 0 {
			updateUserUnreadMessage(r, userId, "Like")
		}
		item.Like = 1
	case "Unlike":
		item.Like = 0
	case "Share":
		item.Share = 1
	case "View":
		item.View = 1
	}

	if err := r.Database.Table("user_stamp_points_record").Where("user_id = ? AND event_id = ? AND sceneryspot_id = ? AND action_user_id = ?", userId, eventId, sceneryspotId, actionUserId).Save(&item).Error; err != nil {
		return err
	}

	return nil
}

func updateUserUnreadMessage(r *MySqlRepository, userId string, messageTpye string) error {

	uum := mPB.UserUnreadMessage{}
	uum.UserId = userId

	if err := r.Database.Table("user_unread_message").Where("user_id = ?", uum.UserId).First(&uum).Error; err != nil {
		uum.Conversation = 0
		uum.Notification = 0
		uum.Followers = 0
		uum.Like = 0
		uum.Share = 0
		uum.Like = 0
		if err := r.Database.Table("user_unread_message").Create(&uum).Error; err != nil {
			return err
		}
	}

	switch messageTpye {
	case "Notification":
		uum.Notification += 1
	case "Conversation":
		uum.Conversation += 1
	case "Followers":
		uum.Followers += 1
	case "Like":
		uum.Like += 1
	case "Share":
		uum.Share += 1
	case "View":
		uum.View += 1
	}

	if err := r.Database.Table("user_unread_message").Where("user_id = ?", uum.UserId).Save(&uum).Error; err != nil {
		return err
	}

	return nil
}

func (r *MySqlRepository) GetUserStampPointsRecord(ctx context.Context, in *pb.UserStampPointsRecordReq) (*pb.UserStampPointsRecordRes, error) {
	result := new(pb.UserStampPointsRecordRes)
	result.Data = make([]*pb.UserStampPointsRecord, 0)

	db := r.Database.Table("user_stamp_points_record").Where("user_id = ?", in.UserId)
	if len(in.EventId) > 0 {
		db = db.Where("event_id = ?", in.EventId)
	}
	if len(in.SceneryspotId) > 0 {
		db = db.Where("sceneryspot_id = ?", in.SceneryspotId)
	}
	if len(in.ActionUserId) > 0 {
		db = db.Where("action_user_id = ?", in.ActionUserId)
	}
	if err := db.Find(&result.Data).Error; err != nil {
		return nil, err
	}

	return result, nil
}
