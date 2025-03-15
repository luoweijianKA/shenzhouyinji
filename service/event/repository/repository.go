package repository

import (
	"context"
	"errors"
	"fmt"
	"time"

	uuid "github.com/satori/go.uuid"
	pb "gitlab.com/annoying-orange/shenzhouyinji/service/event/proto"
	"go-micro.dev/v4/logger"
	"gorm.io/gorm"
)

const StatusDelete = 4

var (
	ErrNotRecord = errors.New("record not found")
)

type Repository interface {
	CreateEvent(ctx context.Context, req *pb.Event) (*pb.EsKeyword, error)
	UpdateEvent(ctx context.Context, req *pb.Event) (*pb.EsUpdateRes, error)
	GetEvent(ctx context.Context, req *pb.EsKeyword) (*pb.Event, error)
	GetEvents(ctx context.Context, req *pb.EsEmptyReq) (*pb.EventsRes, error)

	CreateEventScenerySpots(ctx context.Context, req *pb.EventScenerySpots) (*pb.EventScenerySpots, error)
	RemoveEventScenerySpots(ctx context.Context, req *pb.EventScenerySpots) (*pb.EsUpdateRes, error)
	GetEventScenerySpots(ctx context.Context, req *pb.EsKeyword) (*pb.EventScenerySpotsRes, error)

	CreateBadge(ctx context.Context, req *pb.Badge) (*pb.EsKeyword, error)
	UpdateBadge(ctx context.Context, req *pb.Badge) (*pb.EsUpdateRes, error)
	DeleteBadge(ctx context.Context, in *pb.Badge, out *pb.BadgesRes) error
	GetBadge(ctx context.Context, req *pb.EsKeyword) (*pb.Badge, error)
	GetBadgesByEventID(ctx context.Context, req *pb.EsKeyword) (*pb.BadgesRes, error)

	CreateUserBadge(ctx context.Context, req *pb.UserBadge) (*pb.UserBadge, error)
	UpdateUserBadge(ctx context.Context, req *pb.UserBadge) (*pb.EsUpdateRes, error)
	RemoveUserBadge(ctx context.Context, req *pb.UserBadge) (*pb.EsUpdateRes, error)
	GetUserBadgeByUserID(ctx context.Context, req *pb.EsKeyword) (*pb.UserBadgesRes, error)

	CreateUserBadgeSwap(ctx context.Context, req *pb.UserBadgeSwap) (*pb.EsKeyword, error)
	UpdateUserBadgeSwap(ctx context.Context, req *pb.UserBadgeSwap) (*pb.EsUpdateRes, error)
	GetUserBadgeSwap(ctx context.Context, req *pb.EsKeyword) (*pb.UserBadgeSwap, error)
	GetUserBadgeSwapByPreviousID(ctx context.Context, req *pb.EsKeyword) (*pb.UserBadgeSwap, error)
	GetUserBadgeSwapByFrom(ctx context.Context, req *pb.EsKeyword) (*pb.UserBadgeSwapsRes, error)
	GetUserBadgeSwapByTo(ctx context.Context, req *pb.EsKeyword) (*pb.UserBadgeSwapsRes, error)

	CreatePassportSet(ctx context.Context, req *pb.PassportSet) (*pb.EsKeyword, error)
	UpdatePassportSet(ctx context.Context, req *pb.PassportSet) (*pb.EsUpdateRes, error)
	GetPassportSet(ctx context.Context, req *pb.EsKeyword) (*pb.PassportSet, error)
	GetPassportSetByName(ctx context.Context, req *pb.EsKeyword) (*pb.PassportSet, error)
	GetPassportSetByEventID(ctx context.Context, req *pb.EsKeyword) (*pb.PassportSetsRes, error)

	CreatePassport(ctx context.Context, req *pb.Passport) (*pb.EsKeyword, error)
	UpdatePassport(ctx context.Context, req *pb.Passport) (*pb.EsUpdateRes, error)
	GetPassport(ctx context.Context, req *pb.EsKeyword) (*pb.Passport, error)
	GetPassportByCode(ctx context.Context, req *pb.EsKeyword) (*pb.Passport, error)
	GetPassportByPassportSetID(ctx context.Context, req *pb.EsKeyword) (*pb.PassportsRes, error)
	GetPassports(ctx context.Context, in *pb.PassportRequest, out *pb.PassportsRes) error
	DeletePassport(ctx context.Context, in *pb.DeletePassportRequest, out *pb.PassportsRes) error
	SearchPassports(ctx context.Context, in *pb.SearchPassportRequest, out *pb.SearchPassportResponse) error

	CreateUserPassport(ctx context.Context, req *pb.UserPassport) (*pb.EsKeyword, error)
	UpdateUserPassport(ctx context.Context, req *pb.UserPassport) (*pb.EsUpdateRes, error)
	GetUserPassport(ctx context.Context, in *pb.UserPassport, out *pb.UserPassport) error
	GetUserPassportByUserID(ctx context.Context, req *pb.EsKeyword) (*pb.UserPassportsRes, error)
	GetUserPassportByPassportID(ctx context.Context, req *pb.EsKeyword) (*pb.UserPassport, error)
	GetUserPassportByGuardianName(ctx context.Context, req *pb.EsKeyword) (*pb.UserPassportsRes, error)

	RemoveUserPassport(ctx context.Context, req *pb.EsKeyword) (*pb.EsUpdateRes, error)
	PickupUserPassport(ctx context.Context, req *pb.PickupPassportReq) (*pb.EsKeyword, error)
	UpdateGuardianInfo(ctx context.Context, req *pb.GuardianInfoReq) (*pb.EsUpdateRes, error)
	VerifyUserPassport(ctx context.Context, req *pb.VerifyPassportReq) (*pb.EsUpdateRes, error)
	GetPickupCodeInfo(ctx context.Context, req *pb.EsKeyword) (*pb.PickupCodeRes, error)
	ActivateUserPassport(ctx context.Context, req *pb.ActivatePassportReq) (*pb.EsUpdateRes, error)

	CreateCamp(ctx context.Context, req *pb.Camp) (*pb.EsKeyword, error)
	UpdateCamp(ctx context.Context, req *pb.Camp) (*pb.EsUpdateRes, error)
	GetCamp(ctx context.Context, req *pb.EsKeyword) (*pb.Camp, error)
	GetCampByEventID(ctx context.Context, req *pb.EsKeyword) (*pb.CampsRes, error)
	GetCampWithUser(ctx context.Context, in *pb.CampWithUserRequest, out *pb.CampsRes) error

	CreateHonour(ctx context.Context, req *pb.Honour) (*pb.EsKeyword, error)
	UpdateHonour(ctx context.Context, req *pb.Honour) (*pb.EsUpdateRes, error)
	GetHonour(ctx context.Context, req *pb.EsKeyword) (*pb.Honour, error)
	GetHonourByCampID(ctx context.Context, req *pb.EsKeyword) (*pb.HonoursRes, error)

	CreateUserCamp(ctx context.Context, req *pb.UserCamp) (*pb.EsKeyword, error)
	UpdateUserCamp(ctx context.Context, req *pb.UserCamp) (*pb.EsUpdateRes, error)
	GetUserCamp(ctx context.Context, req *pb.EsKeyword) (*pb.UserCamp, error)
	GetUserCampByCampID(ctx context.Context, req *pb.EsKeyword) (*pb.UserCampsRes, error)

	GetPassportStocks(ctx context.Context, in *pb.PassportStocksRequest, out *pb.PassportStocksResponse) error
	GetIssuedUserPassports(ctx context.Context, in *pb.UserPassportRequest, out *pb.UserPassportsRes) error
	GetUsedUserPassports(ctx context.Context, in *pb.UserPassportRequest, out *pb.UserPassportsRes) error
	GetInactiveUserPassports(ctx context.Context, in *pb.UserPassportRequest, out *pb.UserPassportsRes) error
	GetUserEventPassport(ctx context.Context, in *pb.UserEventPassportRequest, out *pb.UserEventPassportResponse) error
	CheckUserEventPassport(ctx context.Context, in *pb.UserPassport, out *pb.UserEventPassportResponse) error
	CreateUserEventPassport(ctx context.Context, in *pb.UserPassport, out *pb.CreateUserEventPassportResponse) error
	ActivateUserEventPassport(ctx context.Context, in *pb.ActivateUserEventPassportRequest, out *pb.ActivateUserEventPassportResponse) error
	GetClaimEventPassports(ctx context.Context, in *pb.ActivateUserEventPassportRequest, out *pb.ActivateUserEventPassportResponse) error

	GetEventUsers(ctx context.Context, in *pb.EventUserRequest, out *pb.EventUserResponse) error
	UpdateEventUserPoints(ctx context.Context, in *pb.EventUserPoints, out *pb.EventUserPointsResponse) error
	IncrementEventUserPoints(ctx context.Context, in *pb.EventUserPoints, out *pb.EventUserPointsResponse) error
	GetEventTasks(ctx context.Context, in *pb.EventTaskRequest, out *pb.EventTaskResponse) error

	GetCampRanks(ctx context.Context, in *pb.CampRankRequest, out *pb.CampRankResponse) error
	GetUserRanks(ctx context.Context, in *pb.UserRankRequest, out *pb.UserRankResponse) error

	GetUserEvents(ctx context.Context, in *pb.UserEventRequest, out *pb.UserEventResponse) error

	GetUserSwaps(ctx context.Context, in *pb.UserSwapRequest, out *pb.UserSwapResponse) error
	CreateUserSwap(ctx context.Context, in *pb.CreateUserSwapRequest, out *pb.UserSwapResponse) error
	UpdateUserSwap(ctx context.Context, in *pb.UpdateUserSwapRequest, out *pb.UserSwapResponse) error

	GetEventSettings(ctx context.Context, in *pb.EventSettingsRequest, out *pb.EventSettingsResponse) error
	UpdateEventSettings(ctx context.Context, in *pb.UpdateEventSettingsRequest, out *pb.EventSettingsResponse) error

	CreateEventAward(ctx context.Context, in *pb.CreateEventAwardRequest, out *pb.EventAwardResponse) error
	GetEventAwards(ctx context.Context, in *pb.EventAwardRequest, out *pb.EventAwardResponse) error
	UpdateEventAward(ctx context.Context, in *pb.EventAward, out *pb.EventAwardResponse) error
	DeleteEventAward(ctx context.Context, in *pb.DeleteEventAwardRequest, out *pb.EventAwardResponse) error
	GetNewEventAwards(ctx context.Context, in *pb.NewEventAwardRequest, out *pb.EventAwardResponse) error

	UnbindUserPassport(ctx context.Context, in *pb.EsKeyword, out *pb.UserPassportsRes) error
	DeleteUserPassport(ctx context.Context, in *pb.EsKeyword, out *pb.UserPassportsRes) error

	UpdateUserStampCount(ctx context.Context, in *pb.UserStampCountRequest, out *pb.UserStampCountResponse) error
	IncrementUserStampCount(ctx context.Context, in *pb.UserStampCountRequest, out *pb.UserStampCountResponse) error

	GetExportPassports(ctx context.Context, in *pb.ExportPassportRequest, out *pb.ExportPassportResponse) error
}

type MySqlRepository struct {
	Database *gorm.DB
}

// Event
func (r *MySqlRepository) CreateEvent(ctx context.Context, item *pb.Event) (*pb.EsKeyword, error) {
	item.Id = uuid.NewV4().String()
	item.CreateTime = int32(time.Now().Unix())

	if err := r.Database.Table("event").Create(&item).Error; err != nil {
		return nil, err
	}
	return &pb.EsKeyword{Value: item.Id}, nil
}

func (r *MySqlRepository) UpdateEvent(ctx context.Context, item *pb.Event) (*pb.EsUpdateRes, error) {
	db := r.Database
	if item.Status == StatusDelete {
		if err := db.Exec("CALL restore_event(?)", item.Id).Error; err != nil {
			return nil, err
		}
		return &pb.EsUpdateRes{Value: true}, nil
	}

	values := map[string]interface{}{
		"code":         item.Code,
		"name":         item.Name,
		"start_time":   item.StartTime,
		"end_time":     item.EndTime,
		"images":       item.Images,
		"step":         item.Step,
		"introduction": item.Introduction,
		"status":       item.Status,
		"enable_award": item.EnableAward,
		"category_id":  item.CategoryId,
	}

	if err := db.Table("event").Where("id = ?", item.Id).Updates(values).Error; err != nil {
		return nil, err
	}

	return &pb.EsUpdateRes{Value: true}, nil
}

func (r *MySqlRepository) GetEvent(ctx context.Context, req *pb.EsKeyword) (*pb.Event, error) {
	result := new(pb.Event)
	result.Id = req.Value

	if err := r.Database.Table("event").First(&result).Error; err != nil {
		return nil, err
	}

	return result, nil
}

func (r *MySqlRepository) GetEvents(ctx context.Context, req *pb.EsEmptyReq) (*pb.EventsRes, error) {
	result := new(pb.EventsRes)
	result.Data = make([]*pb.Event, 0)

	if err := r.Database.Table("event").Order("code DESC").Find(&result.Data).Error; err != nil {
		return nil, err
	}

	return result, nil
}

// EventScenerySpots
func (r *MySqlRepository) CreateEventScenerySpots(ctx context.Context, item *pb.EventScenerySpots) (*pb.EventScenerySpots, error) {

	es := new(pb.EventScenerySpots)
	r.Database.Table("event_scenery_spot").Where("event_id = ? AND scenery_spot_id = ?", item.EventId, item.ScenerySpotId).First(&es)
	if es.EventId != "" {
		return &pb.EventScenerySpots{EventId: es.EventId, ScenerySpotId: es.ScenerySpotId}, nil
	}

	if err := r.Database.Table("event_scenery_spot").Create(&item).Error; err != nil {
		return nil, err
	}

	return &pb.EventScenerySpots{EventId: item.EventId, ScenerySpotId: item.ScenerySpotId}, nil
}

func (r *MySqlRepository) RemoveEventScenerySpots(ctx context.Context, item *pb.EventScenerySpots) (*pb.EsUpdateRes, error) {
	if err := r.Database.Table("event_scenery_spot").Where("event_id = ? AND scenery_spot_id = ?", item.EventId, item.ScenerySpotId).Delete(&pb.EventScenerySpots{}).Error; err != nil {
		return nil, err
	}

	return &pb.EsUpdateRes{Value: true}, nil
}

func (r *MySqlRepository) GetEventScenerySpots(ctx context.Context, req *pb.EsKeyword) (*pb.EventScenerySpotsRes, error) {
	result := new(pb.EventScenerySpotsRes)
	result.Data = make([]*pb.EventScenerySpots, 0)

	if err := r.Database.Table("event_scenery_spot").Where("event_id = ?", req.Value).Distinct("scenery_spot_id").Find(&result.Data).Error; err != nil {
		return nil, err
	}

	return result, nil
}

// Badge
func (r *MySqlRepository) CreateBadge(ctx context.Context, item *pb.Badge) (*pb.EsKeyword, error) {
	item.Id = uuid.NewV4().String()

	if err := r.Database.Table("badge").Create(&item).Error; err != nil {
		return nil, err
	}
	return &pb.EsKeyword{Value: item.Id}, nil
}

func (r *MySqlRepository) UpdateBadge(ctx context.Context, item *pb.Badge) (*pb.EsUpdateRes, error) {
	if err := r.Database.Table("badge").Where("id = ?", item.Id).Updates(pb.Badge{
		Name:   item.Name,
		Images: item.Images,
	}).Error; err != nil {
		return nil, err
	}

	return &pb.EsUpdateRes{Value: true}, nil
}

func (r *MySqlRepository) DeleteBadge(ctx context.Context, in *pb.Badge, out *pb.BadgesRes) error {
	db := r.Database.Table("badge")
	if err := db.Find(&out.Data, "id = ?", in.Id).Error; err != nil {
		return nil
	}
	if err := r.Database.Table("badge").Delete(&pb.Badge{}, "id = ?", in.Id).Error; err != nil {
		out.Data = []*pb.Badge{}
		return err
	}

	return nil
}

func (r *MySqlRepository) GetBadge(ctx context.Context, req *pb.EsKeyword) (*pb.Badge, error) {
	result := new(pb.Badge)
	result.Id = req.Value

	if err := r.Database.Table("badge").First(&result).Error; err != nil {
		return nil, err
	}

	return result, nil
}

func (r *MySqlRepository) GetBadgesByEventID(ctx context.Context, req *pb.EsKeyword) (*pb.BadgesRes, error) {
	result := new(pb.BadgesRes)
	result.Data = make([]*pb.Badge, 0)

	if err := r.Database.Table("badge").Where("IFNULL(LENGTH(?), 0) = 0 OR event_id = ?", req.Value, req.Value).
		Order("event_id, name").
		Find(&result.Data).Error; err != nil {
		return nil, err
	}

	return result, nil
}

// UserBadge
func (r *MySqlRepository) CreateUserBadge(ctx context.Context, item *pb.UserBadge) (*pb.UserBadge, error) {
	if err := r.Database.Table("user_badge").Create(&item).Error; err != nil {
		return nil, err
	}
	return &pb.UserBadge{
		UserId:  item.UserId,
		BadgeId: item.BadgeId,
		Status:  item.Status,
	}, nil
}

func (r *MySqlRepository) UpdateUserBadge(ctx context.Context, item *pb.UserBadge) (*pb.EsUpdateRes, error) {
	if err := r.Database.Table("user_badge").Where("user_id = ? AND badge_id = ?", item.UserId, item.BadgeId).Updates(pb.UserBadge{
		Status: item.Status,
	}).Error; err != nil {
		return nil, err
	}

	return &pb.EsUpdateRes{Value: true}, nil
}

func (r *MySqlRepository) RemoveUserBadge(ctx context.Context, item *pb.UserBadge) (*pb.EsUpdateRes, error) {
	if err := r.Database.Table("user_badge").Where("user_id = ? AND badge_id = ?", item.UserId, item.BadgeId).Delete(&pb.UserBadge{}).Error; err != nil {
		return nil, err
	}

	return &pb.EsUpdateRes{Value: true}, nil
}

func (r *MySqlRepository) GetUserBadgeByUserID(ctx context.Context, req *pb.EsKeyword) (*pb.UserBadgesRes, error) {
	result := new(pb.UserBadgesRes)
	result.Data = make([]*pb.UserBadge, 0)

	if err := r.Database.Table("user_badge").Where("user_id = ?", req.Value).Find(&result.Data).Error; err != nil {
		return nil, err
	}

	return result, nil
}

// UserBadgeSwap
func (r *MySqlRepository) CreateUserBadgeSwap(ctx context.Context, item *pb.UserBadgeSwap) (*pb.EsKeyword, error) {
	item.Id = uuid.NewV4().String()
	item.CreateTime = int32(time.Now().Unix())

	if err := r.Database.Table("user_badge_swap").Create(&item).Error; err != nil {
		return nil, err
	}
	return &pb.EsKeyword{Value: item.Id}, nil
}

func (r *MySqlRepository) UpdateUserBadgeSwap(ctx context.Context, item *pb.UserBadgeSwap) (*pb.EsUpdateRes, error) {
	if err := r.Database.Table("user_badge_swap").Updates(&item).Error; err != nil {
		return nil, err
	}

	return &pb.EsUpdateRes{Value: true}, nil
}

func (r *MySqlRepository) GetUserBadgeSwap(ctx context.Context, req *pb.EsKeyword) (*pb.UserBadgeSwap, error) {
	result := new(pb.UserBadgeSwap)

	if err := r.Database.Table("user_badge_swap").Where("id = ?", req.Value).Find(&result).Error; err != nil {
		return nil, err
	}

	return result, nil
}

func (r *MySqlRepository) GetUserBadgeSwapByPreviousID(ctx context.Context, req *pb.EsKeyword) (*pb.UserBadgeSwap, error) {
	result := new(pb.UserBadgeSwap)

	if err := r.Database.Table("user_badge_swap").Where("previous_id = ?", req.Value).Find(&result).Error; err != nil {
		return nil, err
	}

	return result, nil
}

func (r *MySqlRepository) GetUserBadgeSwapByFrom(ctx context.Context, req *pb.EsKeyword) (*pb.UserBadgeSwapsRes, error) {
	result := new(pb.UserBadgeSwapsRes)
	result.Data = make([]*pb.UserBadgeSwap, 0)

	if err := r.Database.Table("user_badge_swap").Where("`from` = ?", req.Value).Find(&result.Data).Error; err != nil {
		return nil, err
	}

	return result, nil
}

func (r *MySqlRepository) GetUserBadgeSwapByTo(ctx context.Context, req *pb.EsKeyword) (*pb.UserBadgeSwapsRes, error) {
	result := new(pb.UserBadgeSwapsRes)
	result.Data = make([]*pb.UserBadgeSwap, 0)

	if err := r.Database.Table("user_badge_swap").Where("`to` = ?", req.Value).Find(&result.Data).Error; err != nil {
		return nil, err
	}

	return result, nil
}

// PassportSet
func (r *MySqlRepository) CreatePassportSet(ctx context.Context, item *pb.PassportSet) (*pb.EsKeyword, error) {
	item.Id = uuid.NewV4().String()

	if err := r.Database.Table("passport_set").Create(&item).Error; err != nil {
		return nil, err
	}

	return &pb.EsKeyword{Value: item.Id}, nil
}

func (r *MySqlRepository) UpdatePassportSet(ctx context.Context, item *pb.PassportSet) (*pb.EsUpdateRes, error) {
	if err := r.Database.Table("passport_set").Where("id = ?", item.Id).Updates(pb.PassportSet{
		Name:     item.Name,
		Status:   item.Status,
		Quantity: item.Quantity,
		Issued:   item.Issued,
	}).Error; err != nil {
		return nil, err
	}

	return &pb.EsUpdateRes{Value: true}, nil
}

func (r *MySqlRepository) GetPassportSet(ctx context.Context, req *pb.EsKeyword) (*pb.PassportSet, error) {
	result := new(pb.PassportSet)
	result.Id = req.Value

	if err := r.Database.Table("passport_set").First(&result).Error; err != nil {
		return nil, err
	}

	return result, nil
}

func (r *MySqlRepository) GetPassportSetByName(ctx context.Context, req *pb.EsKeyword) (*pb.PassportSet, error) {
	result := new(pb.PassportSet)

	if err := r.Database.Table("passport_set").Where("name = ?", req.Value).Find(&result).Error; err != nil {
		return nil, err
	}

	return result, nil
}

func (r *MySqlRepository) GetPassportSetByEventID(ctx context.Context, req *pb.EsKeyword) (*pb.PassportSetsRes, error) {
	result := new(pb.PassportSetsRes)
	result.Data = make([]*pb.PassportSet, 0)

	if err := r.Database.Table("passport_set").Where("event_id = ?", req.Value).Find(&result.Data).Error; err != nil {
		return nil, err
	}

	return result, nil
}

// Passport
func (r *MySqlRepository) CreatePassport(ctx context.Context, item *pb.Passport) (*pb.EsKeyword, error) {
	item.Id = uuid.NewV4().String()

	if err := r.Database.Table("passport").Create(&item).Error; err != nil {
		return nil, err
	}

	return &pb.EsKeyword{Value: item.Id}, nil
}

func (r *MySqlRepository) UpdatePassport(ctx context.Context, item *pb.Passport) (*pb.EsUpdateRes, error) {
	if err := r.Database.Table("passport").Where("id = ?", item.Id).Updates(pb.Passport{
		Code:   item.Code,
		Status: item.Status,
	}).Error; err != nil {
		return nil, err
	}

	return &pb.EsUpdateRes{Value: true}, nil
}

func (r *MySqlRepository) UpdatePassportByCode(ctx context.Context, in *pb.Passport) (*pb.EsUpdateRes, error) {
	values := map[string]interface{}{"status": in.Status}
	if err := r.Database.Table("passport").Where("code = ?", in.Code).Updates(values).Error; err != nil {
		return nil, err
	}

	return &pb.EsUpdateRes{Value: true}, nil
}

func (r *MySqlRepository) GetPassport(ctx context.Context, req *pb.EsKeyword) (*pb.Passport, error) {
	result := new(pb.Passport)
	result.Id = req.Value

	if err := r.Database.Table("passport").First(&result).Error; err != nil {
		return nil, err
	}

	return result, nil
}

func (r *MySqlRepository) GetPassportByCode(ctx context.Context, req *pb.EsKeyword) (*pb.Passport, error) {
	result := new(pb.Passport)
	if err := r.Database.Table("passport").Where("code = ?", req.Value).First(&result).Error; err != nil {
		return nil, err
	}

	return result, nil
}

func (r *MySqlRepository) GetPassports(ctx context.Context, in *pb.PassportRequest, out *pb.PassportsRes) error {
	db := r.Database.Table("passport")
	if len(in.EventId) > 0 {
		db = db.Where("passport_set_id IN (SELECT id FROM passport_set WHERE event_id = ?)", in.EventId)
	}
	if len(in.Code) > 0 {
		db = db.Where("code LIKE ?", in.Code+"%")
	}
	if (in.Limit) > 0 {
		db = db.Limit(int(in.Limit))
	}
	if err := db.Order("code").Find(&out.Data).Error; err != nil {
		return err
	}
	return nil
}

func (r *MySqlRepository) DeletePassport(ctx context.Context, in *pb.DeletePassportRequest, out *pb.PassportsRes) error {
	db := r.Database.Table("passport").
		Where("id IN ?", in.Values)
	if err := db.Find(&out.Data).Error; err != nil {
		return err
	}
	if len(out.Data) > 0 {
		if err := db.Delete(&pb.Passport{}).Error; err != nil {
			out.Data = []*pb.Passport{}
			return err
		}
	}
	return nil
}

func (r *MySqlRepository) SearchPassports(ctx context.Context, in *pb.SearchPassportRequest, out *pb.SearchPassportResponse) error {
	db := r.Database.Select(`
			p.id,
			s.event_id,
			p.code,
			u.real_name,
			u.nric, u.phone,
			u.guardian_name,
			u.guardian_nric,
			u.guardian_phone
		`).Table("passport p").
		Joins("INNER JOIN passport_set s on p.passport_set_id = s.id").
		Joins("LEFT JOIN user_passport u ON s.event_id = u.event_id AND p.code = u.passport_code")
	switch in.Search {
	case "CODE":
		db = db.Where("p.code LIKE ?", in.Value+"%")
	case "NAME":
		db = db.Where("u.real_name LIKE ?", in.Value+"%")
	case "NRIC":
		db = db.Where("u.nric LIKE ?", in.Value+"%")
	case "PHONE":
		db = db.Where("u.phone LIKE ?", in.Value+"%")
	case "GUARDIAN_NAME":
		db = db.Where("u.guardian_name LIKE ?", in.Value+"%")
	case "GUARDIAN_NRIC":
		db = db.Where("u.guardian_nric LIKE ?", in.Value+"%")
	case "GUARDIAN_PHONE":
		db = db.Where("u.guardian_phone LIKE ?", in.Value+"%")
	}
	if (in.Limit) > 0 {
		db = db.Limit(int(in.Limit))
	}
	if err := db.Order("code").Find(&out.Data).Error; err != nil {
		return err
	}
	return nil
}

func (r *MySqlRepository) GetPassportByPassportSetID(ctx context.Context, req *pb.EsKeyword) (*pb.PassportsRes, error) {
	result := new(pb.PassportsRes)
	result.Data = make([]*pb.Passport, 0)

	if err := r.Database.Table("passport").Where("passport_set_id = ?", req.Value).Find(&result.Data).Error; err != nil {
		return nil, err
	}

	return result, nil
}

// User Passport
func (r *MySqlRepository) CreateUserPassport(ctx context.Context, item *pb.UserPassport) (*pb.EsKeyword, error) {
	var count int64
	db := r.Database

	if err := db.Table("passport p").
		Joins("INNER JOIN passport_set s on p.passport_set_id = s.id").
		Where("s.event_id = ?", item.EventId).
		Where("p.code = ?", item.PassportCode).
		Count(&count).Error; err != nil {
		return nil, err
	}
	if count == 0 {
		return nil, errors.New("invalid passport")
	}

	if err := db.Table("user_passport").Where("event_id = ? AND passport_code = ?", item.EventId, item.PassportCode).
		Count(&count).Error; err == nil && count > 0 {
		return nil, errors.New("passport already activated")
	}

	m := struct{ ID string }{}
	if err := db.Table("user_passport").Select("id").Where("event_id = ? AND user_id = ?", item.EventId, item.UserId).
		First(&m).Error; err != nil && err.Error() != ErrNotRecord.Error() {
		return nil, err
	}

	value := item.Id
	if len(m.ID) > 0 {
		values := map[string]interface{}{
			"passport_code":  item.PassportCode,
			"real_name":      item.RealName,
			"nric":           item.Nric,
			"phone":          item.Phone,
			"gender":         item.Gender,
			"profession":     item.Profession,
			"claim_code":     item.ClaimCode,
			"authentication": item.Authentication,
			"guardian_name":  item.GuardianName,
			"guardian_nric":  item.GuardianNric,
			"guardian_phone": item.GuardianPhone,
			"claim_by":       item.ClaimBy,
			"claim_time":     item.ClaimTime,
			"status":         item.Status,
		}
		if err := r.Database.Table("user_passport").Where("id = ?", m.ID).Updates(values).Error; err != nil {
			return nil, err
		}
		value = m.ID
	} else {
		if err := r.Database.Table("user_passport").Create(&item).Error; err != nil {
			return nil, err
		}
	}

	if len(item.PassportCode) > 0 {
		r.UpdatePassportByCode(ctx, &pb.Passport{Code: item.PassportCode, Status: 3})
	}

	if _, err := r.CreateUserCamp(ctx, &pb.UserCamp{UserId: item.UserId, EventId: item.EventId, PassportId: value, Points: 0, StampCount: 0, Status: 1}); err != nil {
		fmt.Println(err)
	}

	return &pb.EsKeyword{Value: value}, nil
}

func (r *MySqlRepository) UpdateUserPassport(ctx context.Context, item *pb.UserPassport) (*pb.EsUpdateRes, error) {
	var count int64
	db := r.Database
	if err := db.Table("passport p").
		Joins("INNER JOIN passport_set s on p.passport_set_id = s.id").
		Where("s.event_id = ?", item.EventId).
		Where("p.code = ?", item.PassportCode).
		Count(&count).Error; err != nil || count == 0 {
		return nil, errors.New("invalid passport")
	}

	if err := db.Table("user_passport").
		Where("event_id = ? AND passport_code = ?", item.EventId, item.PassportCode).
		Count(&count).Error; err != nil || count > 0 {
		return nil, errors.New("passport already activated")
	}

	if err := db.Table("user_passport").Where("id = ?", item.Id).Updates(&item).Error; err != nil {
		return nil, err
	}

	if len(item.UserCampId) > 0 {
		uc := &pb.UserCamp{
			UserId:     item.UserId,
			EventId:    item.EventId,
			PassportId: item.Id,
			CampId:     item.UserCampId,
			Points:     0,
			StampCount: 0,
			Status:     1,
		}
		if _, err := r.CreateUserCamp(ctx, uc); err != nil {
			fmt.Println(err)
		}
	}

	if len(item.PassportCode) > 0 {
		r.UpdatePassportByCode(ctx, &pb.Passport{Code: item.PassportCode, Status: 3})
	}

	return &pb.EsUpdateRes{Value: true}, nil
}

func (r *MySqlRepository) GetUserPassport(ctx context.Context, in *pb.UserPassport, out *pb.UserPassport) error {
	if in == nil {
		return nil
	}
	if err := r.Database.Table("user_passport").First(&out, &in).Error; err != nil {
		return err
	}
	return nil
}

func (r *MySqlRepository) GetUserPassportByUserID(ctx context.Context, req *pb.EsKeyword) (*pb.UserPassportsRes, error) {
	result := new(pb.UserPassportsRes)
	result.Data = make([]*pb.UserPassport, 0)

	if err := r.Database.Table("user_passport").Where("user_id = ?", req.Value).Find(&result.Data).Error; err != nil {
		return nil, err
	}

	return result, nil
}

func (r *MySqlRepository) GetUserPassportByPassportID(ctx context.Context, req *pb.EsKeyword) (*pb.UserPassport, error) {
	result := new(pb.UserPassport)
	if err := r.Database.Table("user_passport").Where("passport_id = ?", req.Value).First(&result).Error; err != nil {
		return nil, err
	}

	return result, nil
}

func (r *MySqlRepository) GetUserPassportByGuardianName(ctx context.Context, req *pb.EsKeyword) (*pb.UserPassportsRes, error) {
	result := new(pb.UserPassportsRes)
	result.Data = make([]*pb.UserPassport, 0)

	if err := r.Database.Table("user_passport").Where("guardian_name = ?", req.Value).Find(&result.Data).Error; err != nil {
		return nil, err
	}

	return result, nil
}

func (r *MySqlRepository) RemoveUserPassport(ctx context.Context, req *pb.EsKeyword) (*pb.EsUpdateRes, error) {
	if err := r.Database.Table("user_passport").Where("id = ?", req.Value).Delete(&pb.UserPassport{}).Error; err != nil {
		return nil, err
	}

	return &pb.EsUpdateRes{Value: true}, nil
}

func (r *MySqlRepository) PickupUserPassport(ctx context.Context, req *pb.PickupPassportReq) (*pb.EsKeyword, error) {
	userPassport := new(pb.UserPassport)

	if err := r.Database.Table("user_passport").Where("nric = ? AND phone = ?", req.Nric, req.Phone).First(&userPassport).Error; err != nil {

		if err := r.Database.Table("user_passport").Where("nric = ? ", req.Nric).First(&userPassport).Error; err != nil {

			if err := r.Database.Table("user_passport").Where("phone = ? ", req.Phone).First(&userPassport).Error; err != nil {

				userPassport.Id = uuid.NewV4().String()
				userPassport.UserId = req.UserId
				userPassport.EventId = req.EventId
				userPassport.RealName = req.RealName
				userPassport.Nric = req.Nric
				userPassport.Phone = req.Phone
				userPassport.Gender = req.Gender
				userPassport.Profession = req.Profession

				if req.Age <= 14 {
					userPassport.Status = 2
				} else {
					userPassport.Status = 1
				}

				if err := r.Database.Table("user_passport").Create(&userPassport).Error; err != nil {
					return nil, err
				}

				return &pb.EsKeyword{Value: userPassport.Id}, nil
			}

			return nil, errors.New("phone number already exist")
		}

		return nil, errors.New("nric already exist")
	}

	return nil, errors.New("nric and phone number already exist")
}

func (r *MySqlRepository) UpdateGuardianInfo(ctx context.Context, req *pb.GuardianInfoReq) (*pb.EsUpdateRes, error) {
	if err := r.Database.Table("user_passport").Where("id = ?", req.Id).Updates(pb.UserPassport{
		GuardianName:  req.GuardianName,
		GuardianNric:  req.GuardianNric,
		GuardianPhone: req.GuardianPhone,
		Status:        1,
	}).Error; err != nil {
		return nil, err
	}

	return &pb.EsUpdateRes{Value: true}, nil
}

func (r *MySqlRepository) VerifyUserPassport(ctx context.Context, req *pb.VerifyPassportReq) (*pb.EsUpdateRes, error) {
	if err := r.Database.Table("user_passport").Where("id = ?", req.Id).Updates(pb.UserPassport{
		Authentication: req.Verify,
	}).Error; err != nil {
		return nil, err
	}

	return &pb.EsUpdateRes{Value: true}, nil
}

func (r *MySqlRepository) GetPickupCodeInfo(ctx context.Context, req *pb.EsKeyword) (*pb.PickupCodeRes, error) {
	result := new(pb.UserPassport)
	result.Id = req.Value

	if err := r.Database.Table("user_passport").First(&result).Error; err != nil {
		return nil, err
	}

	return &pb.PickupCodeRes{
		UserId:         result.UserId,
		RealName:       result.RealName,
		Nric:           result.Nric,
		Phone:          result.Phone,
		Authentication: result.Authentication,
		Status:         result.Status,
	}, nil
}

func (r *MySqlRepository) ActivateUserPassport(ctx context.Context, req *pb.ActivatePassportReq) (*pb.EsUpdateRes, error) {
	var count int64

	db := r.Database
	if err := db.Table("passport p").
		Joins("INNER JOIN passport_set s on p.passport_set_id = s.id").
		Where("s.event_id = ?", req.EventId).
		Where("p.code = ?", req.PassportCode).
		Count(&count).Error; err != nil {
		return nil, err
	}
	if count == 0 {
		return nil, errors.New("invalid passport code")
	}

	if err := db.Table("user_passport").
		Where("event_id = ? AND passport_code = ? AND user_id != ''", req.EventId, req.PassportCode).
		Count(&count).Error; err != nil {
		return nil, err
	}
	if count == 0 {
		return nil, errors.New("passport already activated")
	}

	userPassport := pb.UserPassport{
		Id:           uuid.NewV4().String(),
		UserId:       req.UserId,
		EventId:      req.EventId,
		PassportCode: req.PassportCode,
		Status:       1,
	}
	if err := db.Table("user_passport").Create(&userPassport).Error; err != nil {
		return nil, err
	}

	if len(req.PassportCode) > 0 {
		r.UpdatePassportByCode(ctx, &pb.Passport{Code: req.PassportCode, Status: 3})
	}

	return &pb.EsUpdateRes{Value: true}, nil
}

// Camp
func (r *MySqlRepository) CreateCamp(ctx context.Context, item *pb.Camp) (*pb.EsKeyword, error) {
	item.Id = uuid.NewV4().String()

	if err := r.Database.Table("camp").Create(&item).Error; err != nil {
		return nil, err
	}

	return &pb.EsKeyword{Value: item.Id}, nil
}

func (r *MySqlRepository) UpdateCamp(ctx context.Context, item *pb.Camp) (*pb.EsUpdateRes, error) {
	db := r.Database.Table("camp")
	if item.Status == StatusDelete {
		if err := db.Delete(&pb.Camp{}, "id = ?", item.Id).Error; err != nil {
			return nil, err
		}
		return &pb.EsUpdateRes{Value: true}, nil
	}

	if err := db.Where("id = ?", item.Id).Updates(pb.Camp{
		Name:         item.Name,
		Images:       item.Images,
		Introduction: item.Introduction,
		Points:       item.Points,
		Status:       item.Status,
		CategoryId:   item.CategoryId,
	}).Error; err != nil {
		return nil, err
	}

	return &pb.EsUpdateRes{Value: true}, nil
}

func (r *MySqlRepository) GetCamp(ctx context.Context, req *pb.EsKeyword) (*pb.Camp, error) {
	result := new(pb.Camp)
	result.Id = req.Value

	if err := r.Database.Table("camp").First(&result).Error; err != nil {
		return nil, err
	}
	return result, nil
}

func (r *MySqlRepository) GetCampByEventID(ctx context.Context, req *pb.EsKeyword) (*pb.CampsRes, error) {
	result := new(pb.CampsRes)
	result.Data = make([]*pb.Camp, 0)

	if err := r.Database.Table("camp").Where("event_id = ?", req.Value).Find(&result.Data).Error; err != nil {
		return nil, err
	}

	return result, nil
}

func (r *MySqlRepository) GetCampWithUser(ctx context.Context, in *pb.CampWithUserRequest, out *pb.CampsRes) error {
	if err := r.Database.Table("camp").
		Joins("INNER JOIN user_camp u on camp.id = u.camp_id").
		Where("u.user_id = ? AND u.event_id = ?", in.UserId, in.EventId).
		Find(&out.Data).Error; err != nil {
		return err
	}
	return nil
}

// Honour
func (r *MySqlRepository) CreateHonour(ctx context.Context, item *pb.Honour) (*pb.EsKeyword, error) {
	item.Id = uuid.NewV4().String()

	if err := r.Database.Table("honour").Create(&item).Error; err != nil {
		return nil, err
	}

	return &pb.EsKeyword{Value: item.Id}, nil
}

func (r *MySqlRepository) UpdateHonour(ctx context.Context, item *pb.Honour) (*pb.EsUpdateRes, error) {
	db := r.Database.Table("honour")
	if item.Status == StatusDelete {
		if err := db.Delete(&pb.Honour{}, "id = ?", item.Id).Error; err != nil {
			return nil, err
		}
		return &pb.EsUpdateRes{Value: true}, nil
	}

	if err := db.Where("id = ?", item.Id).Updates(pb.Honour{
		Name:      item.Name,
		Images:    item.Images,
		MinPoints: item.MinPoints,
		MaxPoints: item.MaxPoints,
		Status:    item.Status,
	}).Error; err != nil {
		return nil, err
	}

	return &pb.EsUpdateRes{Value: true}, nil
}

func (r *MySqlRepository) GetHonour(ctx context.Context, req *pb.EsKeyword) (*pb.Honour, error) {
	result := new(pb.Honour)
	result.Id = req.Value

	if err := r.Database.Table("honour").First(&result).Error; err != nil {
		return nil, err
	}

	return result, nil
}

func (r *MySqlRepository) GetHonourByCampID(ctx context.Context, req *pb.EsKeyword) (*pb.HonoursRes, error) {
	result := new(pb.HonoursRes)
	result.Data = make([]*pb.Honour, 0)

	if err := r.Database.Table("honour").Where("camp_id = ?", req.Value).Find(&result.Data).Error; err != nil {
		return nil, err
	}

	return result, nil
}

// UserCamp
func (r *MySqlRepository) CreateUserCamp(ctx context.Context, item *pb.UserCamp) (*pb.EsKeyword, error) {
	db := r.Database

	v := struct {
		ID         string
		PassportID string
		Points     int32
	}{}
	if err := db.Table("user_camp").Select("id, passport_id, points").Where("user_id = ? AND event_id = ?", item.UserId, item.EventId).
		First(&v).Error; err != nil {
		if err.Error() != ErrNotRecord.Error() {
			return nil, err
		}

		item.Id = uuid.NewV4().String()
		item.CreateTime = int32(time.Now().Unix())

		if err := db.Table("user_camp").Create(&item).Error; err != nil {
			return nil, err
		}

		v.ID = item.Id
		v.PassportID = item.PassportId
	} else {
		honour := struct{ ID string }{}
		db.Table("honour").
			Select("id").
			Where("camp_id = ? AND min_points <= ? AND max_points > ?", item.CampId, v.Points, v.Points).
			First(&honour)

		if err := db.Table("user_camp").Where("id = ?", v.ID).
			Updates(map[string]interface{}{"camp_id": item.CampId, "honour": honour.ID}).Error; err != nil {
			return nil, err
		}
	}

	if err := db.Table("user_passport").Where("id = ?", v.PassportID).
		UpdateColumns(map[string]interface{}{"user_camp_id": v.ID, "status": 3}).
		Error; err != nil {
		return nil, err
	}

	return &pb.EsKeyword{Value: v.ID}, nil
}

func (r *MySqlRepository) UpdateUserCamp(ctx context.Context, item *pb.UserCamp) (*pb.EsUpdateRes, error) {
	if item.Status == StatusDelete {
		if err := r.Database.Table("user_camp").Delete(&pb.Event{}, "user_id = ? AND camp_id = ?", item.UserId, item.CampId).Error; err != nil {
			return nil, err
		}
		return &pb.EsUpdateRes{Value: true}, nil
	}

	if err := r.Database.Table("user_camp").Where("user_id = ? AND camp_id = ?", item.UserId, item.CampId).Updates(pb.UserCamp{
		Points:     item.Points,
		StampCount: item.StampCount,
		Status:     item.Status,
	}).Error; err != nil {
		return nil, err
	}

	if item.Points > 0 {
		updateUserHonour(item, r)
	}

	return &pb.EsUpdateRes{Value: true}, nil
}

func updateUserHonour(uc *pb.UserCamp, r *MySqlRepository) error {
	if uc.Points == 0 {
		return nil
	}

	var honour pb.Honour
	if err := r.Database.Table("honour").Where("camp_id = ? AND min_points <= ?", uc.CampId, uc.Points).
		Order("max_points DESC").First(&honour).Error; err == nil {
		if uc.Honour != honour.Id {
			uc.Honour = honour.Id
			r.Database.Table("user_camp").Where("id = ?", uc.Id).Update("honour", uc.Honour)
		}
	}

	return nil
}

func (r *MySqlRepository) GetUserCamp(ctx context.Context, req *pb.EsKeyword) (*pb.UserCamp, error) {
	result := new(pb.UserCamp)

	if err := r.Database.Table("user_camp").Where("id = ? AND LENGTH(camp_id) > 0", req.Value).First(&result).Error; err != nil {
		return nil, err
	}

	return result, nil
}

func (r *MySqlRepository) GetUserCampByCampID(ctx context.Context, req *pb.EsKeyword) (*pb.UserCampsRes, error) {
	result := new(pb.UserCampsRes)
	result.Data = make([]*pb.UserCamp, 0)

	if err := r.Database.Table("user_camp").Where("camp_id = ?", req.Value).Find(&result.Data).Error; err != nil {
		return nil, err
	}

	return result, nil
}

func (r *MySqlRepository) GetPassportStocks(ctx context.Context, in *pb.PassportStocksRequest, out *pb.PassportStocksResponse) error {
	db := r.Database
	results := []struct {
		ID          string
		Name        string
		Total       int
		IssuedCount int
		UsedCount   int
	}{}

	err := db.Table("event").
		Select(`
			id,
			name, 
			(SELECT COUNT(1) FROM passport p INNER JOIN passport_set s ON p.passport_set_id = s.id WHERE s.event_id = event.id) AS total,
			(SELECT COUNT(1) FROM user_passport p WHERE p.event_id = event.id AND p.passport_code = '') AS issued_count,
			(SELECT COUNT(1) FROM user_passport p WHERE p.event_id = event.id AND p.passport_code <> '') AS used_count
		`).
		Group("id, name").
		Order("code").Find(&results).Error
	if err != nil {
		return err
	}

	out.Data = make([]*pb.PassportStock, len(results))
	for i, v := range results {
		out.Data[i] = &pb.PassportStock{
			EventID:        v.ID,
			EventName:      v.Name,
			Total:          int32(v.Total),
			IssuedCount:    int32(v.IssuedCount),
			UsedCount:      int32(v.UsedCount),
			AvailableCount: int32(v.Total - v.IssuedCount - v.UsedCount),
		}
	}

	return nil
}

func (r *MySqlRepository) GetIssuedUserPassports(ctx context.Context, in *pb.UserPassportRequest, out *pb.UserPassportsRes) error {
	query := "status = 0"
	args := []interface{}{}
	if len(in.Name) > 0 {
		query += " AND real_name LIKE ?"
		args = append(args, "%"+in.Name+"%")
	}
	if len(in.Nric) > 0 {
		query += " AND nric LIKE ?"
		args = append(args, "%"+in.Nric+"%")
	}
	if len(in.Phone) > 0 {
		query += " AND phone LIKE ?"
		args = append(args, "%"+in.Phone+"%")
	}

	data := []*pb.UserPassport{}
	if err := r.Database.Table("user_passport").Where(query, args...).Order("create_time DESC").Find(&data).Error; err != nil {
		return err
	}
	out.Data = data

	return nil
}

func (r *MySqlRepository) GetUsedUserPassports(ctx context.Context, in *pb.UserPassportRequest, out *pb.UserPassportsRes) error {
	query := "user_id <> '' AND passport_code <> ''"
	args := []interface{}{}
	if len(in.Name) > 0 {
		query += " AND real_name LIKE ?"
		args = append(args, "%"+in.Name+"%")
	}
	if len(in.Nric) > 0 {
		query += " AND nric LIKE ?"
		args = append(args, "%"+in.Nric+"%")
	}
	if len(in.Phone) > 0 {
		query += " AND phone LIKE ?"
		args = append(args, "%"+in.Phone+"%")
	}

	data := []*pb.UserPassport{}
	if err := r.Database.Table("user_passport").
		Select(`
			id,
			user_id,
			user_camp_id,
			event_id,
			passport_code,
			real_name,
			nric,
			phone,
			gender,
			profession,
			claim_code,
			authentication,
			guardian_name,
			guardian_nric,
			guardian_phone,
			(SELECT IFNULL(wechat_name, login_id) FROM user u WHERE u.id = claim_by) AS claim_by,
			claim_time,
			status,
			create_time
		`).
		Where(query, args...).Order("create_time DESC").Find(&data).Error; err != nil {
		return err
	}
	out.Data = data

	return nil
}

func (r *MySqlRepository) GetInactiveUserPassports(ctx context.Context, in *pb.UserPassportRequest, out *pb.UserPassportsRes) error {
	query := "status = 0"
	args := []interface{}{}
	if len(in.Name) > 0 {
		query += " AND real_name LIKE ?"
		args = append(args, "%"+in.Name+"%")
	}
	if len(in.Nric) > 0 {
		query += " AND nric LIKE ?"
		args = append(args, "%"+in.Nric+"%")
	}
	if len(in.Phone) > 0 {
		query += " AND phone LIKE ?"
		args = append(args, "%"+in.Phone+"%")
	}

	data := []*pb.UserPassport{}
	if err := r.Database.Table("user_passport").Order("create_time DESC").Where(query, args...).Find(&data).Error; err != nil {
		return err
	}
	out.Data = data

	return nil
}

func (r *MySqlRepository) GetUserEventPassport(ctx context.Context, in *pb.UserEventPassportRequest, out *pb.UserEventPassportResponse) error {
	if err := r.Database.Table("user_passport").
		Where("event_id = ? AND ((user_id != '' AND user_id = ?) OR (phone != '' AND phone = ?))", in.EventID, in.UserID, in.Phone).
		Find(&out.Data).Error; err != nil {
		if err.Error() == ErrNotRecord.Error() {
			out.Data = nil
			return nil
		}
		return err
	}

	return nil
}

func (r *MySqlRepository) CheckUserEventPassport(ctx context.Context, in *pb.UserPassport, out *pb.UserEventPassportResponse) error {
	db := r.Database
	results := []struct {
		ID    string
		Nric  string
		Phone string
	}{}

	if err := db.Table("user_passport").Select("id, nric, phone").Where("event_id = ? and (nric = ? or phone = ?)", in.EventId, in.Nric, in.Phone).
		Find(&results).Error; err != nil {
		return err
	}
	if len(results) > 0 {
		r := results[0]
		if r.Nric == in.Nric && r.Phone == in.Phone {
			return errors.New("nric and phone already exist")
		}
		if r.Nric == in.Nric {
			return errors.New("nric already exist")
		}
		if r.Phone == in.Phone {
			return errors.New("phone already exist")
		}
		return errors.New("invalid user")
	}

	return nil
}

func (r *MySqlRepository) CreateUserEventPassport(ctx context.Context, in *pb.UserPassport, out *pb.CreateUserEventPassportResponse) error {
	if err := r.CheckUserEventPassport(ctx, in, &pb.UserEventPassportResponse{}); err != nil {
		return err
	}

	if err := r.Database.Table("user_passport").Create(in).Error; err != nil {
		return err
	}

	if len(in.PassportCode) > 0 {
		r.UpdatePassportByCode(ctx, &pb.Passport{Code: in.PassportCode, Status: 3})
	}

	out.Id = in.Id

	return nil
}

func (r *MySqlRepository) ActivateUserEventPassport(ctx context.Context, in *pb.ActivateUserEventPassportRequest, out *pb.ActivateUserEventPassportResponse) error {
	var count int64
	db := r.Database

	if err := db.Table("passport p").
		Joins("INNER JOIN passport_set s on p.passport_set_id = s.id").
		Where("s.event_id = ?", in.EvnetId).
		Where("p.code = ?", in.PassportCode).
		Count(&count).Error; err != nil {
		return err
	}
	if count == 0 {
		return errors.New("invalid passport")
	}

	if err := db.Table("user_passport").Where("event_id = ? AND passport_code = ?", in.EvnetId, in.PassportCode).
		Count(&count).Error; err == nil && count > 0 {
		return errors.New("passport already activated")
	}

	status := int32(1)
	passport := struct {
		ID           string
		EventID      string
		UserID       string
		PassportCode string
	}{}
	if err := db.Table("user_passport").Where("id = ?", in.Id).First(&passport).Error; err != nil {
		return err
	}
	if passport.EventID != in.EvnetId {
		return errors.New("invalid passport")
	}
	if len(passport.PassportCode) > 0 {
		return errors.New("invalid activate")
	}

	if len(passport.UserID) == 0 {
		if err := db.Table("user_passport").Where("id = ?", in.Id).UpdateColumns(map[string]interface{}{
			"user_id":       in.UserId,
			"passport_code": in.PassportCode,
			"claim_code":    in.PassportCode,
			"claim_by":      in.ClaimBy,
			"claim_time":    in.ClaimTime,
			"status":        status,
		}).Error; err != nil {
			return err
		}

		r.UpdatePassportByCode(ctx, &pb.Passport{Code: in.PassportCode, Status: 3})

		out.Data = []*pb.UserEventPassport{
			{
				Id:           in.Id,
				UserId:       in.UserId,
				EventId:      in.EvnetId,
				PassportCode: in.PassportCode,
				ClaimBy:      in.ClaimBy,
				ClaimTime:    in.ClaimTime,
				Status:       status,
			},
		}

		r.CreateUserCamp(ctx, &pb.UserCamp{UserId: in.UserId, EventId: in.EvnetId, PassportId: in.Id, Points: 0, StampCount: 0, Status: 1})

		return nil
	}

	if passport.UserID == in.UserId && len(passport.PassportCode) == 0 {
		if err := db.Table("user_passport").Where("id = ?", in.Id).UpdateColumns(map[string]interface{}{
			"passport_code": in.PassportCode,
			"claim_code":    in.PassportCode,
			"claim_by":      in.ClaimBy,
			"claim_time":    in.ClaimTime,
			"status":        status,
		}).Error; err != nil {
			return err
		}

		r.UpdatePassportByCode(ctx, &pb.Passport{Code: in.PassportCode, Status: 3})

		out.Data = []*pb.UserEventPassport{
			{
				Id:           in.Id,
				UserId:       in.UserId,
				EventId:      in.EvnetId,
				PassportCode: in.PassportCode,
				ClaimBy:      in.ClaimBy,
				ClaimTime:    in.ClaimTime,
				Status:       status,
			},
		}

		r.CreateUserCamp(ctx, &pb.UserCamp{UserId: in.UserId, EventId: in.EvnetId, PassportId: in.Id, Points: 0, StampCount: 0, Status: 1})

		return nil
	}

	return errors.New("invalid activate")
}

func (r *MySqlRepository) GetClaimEventPassports(ctx context.Context, in *pb.ActivateUserEventPassportRequest, out *pb.ActivateUserEventPassportResponse) error {
	db := r.Database.Table("user_passport")
	if len(in.Id) > 0 {
		db = db.Where("id = ?", in.Id)
	}
	if len(in.UserId) > 0 {
		db = db.Where("user_id = ?", in.UserId)
	}
	if len(in.EvnetId) > 0 {
		db = db.Where("event_id = ?", in.EvnetId)
	}
	if len(in.PassportCode) > 0 {
		db = db.Where("passport_code = ?", in.PassportCode)
	}
	if len(in.ClaimBy) > 0 {
		db = db.Where("claim_by = ?", in.ClaimBy)
	}
	if in.ClaimTime > 0 {
		db = db.Where("claim_time >= ?", in.ClaimTime)
	}

	if err := db.Order("claim_time DESC").Find(&out.Data).Error; err != nil {
		return err
	}
	return nil
}

func (r *MySqlRepository) getEventUser(ctx context.Context, userID string, eventID string, campID string) (*pb.EventUser, error) {
	dest := pb.EventUser{}
	db := r.Database.Table("user_camp").
		Select(`
			user_camp.id,
			user_camp.event_id,
			user_camp.user_id,
			user.wechat_name AS user_name,
			user.wechat AS user_wechat,
			user_camp.camp_id,
			camp.name AS camp_name,
			user_camp.points,
			user_profile.city,
			user_profile.email,
			user_profile.phone
		`).
		Joins("INNER JOIN user ON user_camp.user_id = user.id").
		Joins("INNER JOIN camp ON user_camp.camp_id = camp.id").
		Joins("INNER JOIN user_profile ON user_camp.user_id = user_profile.id").
		Where("user_camp.user_id = ?", userID).
		Where("user_camp.event_id = ?", eventID).
		Where("user_camp.camp_id = ?", campID)
	if err := db.Order("user.wechat_name").Find(&dest).Error; err != nil {
		return nil, err
	}

	return &dest, nil
}

func (r *MySqlRepository) GetEventUsers(ctx context.Context, in *pb.EventUserRequest, out *pb.EventUserResponse) error {
	db := r.Database.Table("user_camp").
		Select(`
			user_camp.id,
			user_camp.event_id,
			user_camp.user_id,
			user.wechat_name AS user_name,
			user.wechat AS user_wechat,
			user_camp.camp_id,
			camp.name AS camp_name,
			user_camp.points,
			user_camp.stamp_count,
			user_profile.city,
			user_profile.email,
			user_profile.phone
		`).
		Joins("INNER JOIN user ON user_camp.user_id = user.id").
		Joins("INNER JOIN camp ON user_camp.camp_id = camp.id").
		Joins("INNER JOIN user_profile ON user_camp.user_id = user_profile.id").
		Where("user_camp.event_id = ?", in.EventId)
	if len(in.Camps) > 0 {
		db = db.Where("user_camp.camp_id IN ?", in.Camps)
	}
	if err := db.Order("user.wechat_name").Find(&out.Data).Error; err != nil {
		return err
	}

	return nil
}

func (r *MySqlRepository) UpdateEventUserPoints(ctx context.Context, in *pb.EventUserPoints, out *pb.EventUserPointsResponse) error {
	db := r.Database.Table("user_camp")
	if err := db.Where(&pb.UserCamp{UserId: in.UserId, EventId: in.EventId, CampId: in.CampId}).
		Update("points", in.Points).Error; err != nil {
		return err
	}

	if data, err := r.getEventUser(ctx, in.UserId, in.EventId, in.CampId); err == nil {
		out.Data = data
	}

	uc := pb.UserCamp{}
	if err := r.Database.Table("user_camp").
		Select("id, camp_id, points").
		Where(&pb.UserCamp{UserId: in.UserId, EventId: in.EventId, CampId: in.CampId}).
		First(&uc).Error; err != nil {
		return err
	}

	return updateUserHonour(&uc, r)
}

func (r *MySqlRepository) IncrementEventUserPoints(ctx context.Context, in *pb.EventUserPoints, out *pb.EventUserPointsResponse) error {
	if err := r.Database.Table("user_camp").Where(&pb.UserCamp{UserId: in.UserId, EventId: in.EventId}).
		Update("points", gorm.Expr("points + ?", in.Points)).Error; err != nil {
		return err
	}

	if len(in.CampId) > 0 && in.CampPoints != 0 {
		if err := r.Database.Table("camp").Where("id = ?", in.CampId).
			Update("points", gorm.Expr("points + ?", in.CampPoints)).Error; err != nil {
			return err
		}
	}

	uc := pb.UserCamp{}
	if err := r.Database.Table("user_camp").
		Select("id, camp_id, points").
		Where(&pb.UserCamp{UserId: in.UserId, EventId: in.EventId, CampId: in.CampId}).
		First(&uc).Error; err != nil {
		return err
	}
	updateUserHonour(&uc, r)

	data, err := r.getEventUser(ctx, in.UserId, in.EventId, in.CampId)
	if err == nil {
		out.Data = data
	}

	return err
}

func (r *MySqlRepository) GetEventTasks(ctx context.Context, in *pb.EventTaskRequest, out *pb.EventTaskResponse) error {
	db := r.Database
	data := []*pb.EventTask{}
	conds := map[string]interface{}{"user_task.event_id": in.EventId}
	if len(in.Camps) > 0 {
		conds["user_task.camp_id"] = in.Camps
	}
	if len(in.Sceneryppots) > 0 {
		conds["user_task.sceneryspot_id"] = in.Sceneryppots
	}

	err := db.Table("user_task").
		Select(`
			user_task.id,
			user_task.user_id,
			user.wechat_name AS user_name,
			user.wechat AS user_wechat,
			user_task.camp_id,
			camp.name AS camp_name,
			user_task.task_id,
			user_task.task_category,
			user_task.points,
			user_task.result,
			user_task.status,
			user_task.audit,
			user_task.create_time
		`).
		Joins("INNER JOIN user on user_task.user_id = user.id").
		Joins("INNER JOIN camp on user_task.camp_id = camp.id").
		Find(&data, conds).Error
	if err != nil {
		return err
	}

	out.Data = data

	return nil
}

func (r *MySqlRepository) GetCampRanks(ctx context.Context, in *pb.CampRankRequest, out *pb.CampRankResponse) error {
	db := r.Database
	eventID := in.EventId

	if err := db.Table("camp").
		Select(`
			camp.id,
			camp.name,
			camp.images,
			camp.points,
			(SELECT COUNT(1) FROM user_camp WHERE user_camp.camp_id = camp.id) AS user_count
		`).
		Where("camp.event_id = ?", eventID).
		Order("camp.points DESC").
		Find(&out.Data).
		Error; err != nil {
		return err
	}

	return nil
}

func (r *MySqlRepository) GetUserRanks(ctx context.Context, in *pb.UserRankRequest, out *pb.UserRankResponse) error {
	db := r.Database
	eventID := in.EventId

	if err := db.Table("user").
		Select(`
			user.id,
			user.wechat_name AS name,
			user_camp.stamp_count AS trip_count,
			user_camp.points,
			honour.id AS honour_id,
			honour.name AS honour_name,
			camp.id AS camp_id,
			camp.name AS camp_name
		`).
		Joins("INNER JOIN user_camp ON user.id = user_camp.user_id").
		Joins("INNER JOIN camp ON user_camp.camp_id = camp.id").
		Joins("LEFT JOIN honour on user_camp.honour = honour.id").
		Where("camp.event_id = ?", eventID).
		Order("user_camp.points DESC, user_camp.user_id").
		Find(&out.Data).
		Error; err != nil {
		return err
	}

	return nil
}

func (r *MySqlRepository) GetUserEvents(ctx context.Context, in *pb.UserEventRequest, out *pb.UserEventResponse) error {
	db := r.Database.Table("event e").
		Select(`
			e.id,
			e.name,
			e.images,
			e.start_time,
			e.end_time,
			e.status,
			p.passport_code,
			c.id AS camp_id,
			c.name AS camp_name,
			c.points AS camp_points,
			(SELECT row_num FROM (SELECT ROW_NUMBER() OVER (ORDER BY points DESC, id) row_num, id FROM camp WHERE event_id = e.id) r WHERE r.id = c.id LIMIT 1) AS camp_ranking,
			uc.points AS user_points,
			(SELECT row_num FROM (SELECT ROW_NUMBER() OVER (ORDER BY points DESC, user_id) row_num, camp_id, user_id FROM user_camp WHERE event_id = e.id) r WHERE r.camp_id = c.id AND r.user_id = p.user_id LIMIT 1) AS user_ranking,
			IFNULL(h.name, '') AS user_honour
		`).
		Joins("INNER JOIN user_passport p ON e.id = p.event_id").
		Joins("LEFT JOIN user_camp uc on p.user_camp_id = uc.id").
		Joins("LEFT JOIN camp c on uc.camp_id = c.id").
		Joins("LEFT JOIN honour h ON uc.honour = h.id").
		Where("p.user_id = ? AND p.passport_code <> ''", in.UserId)
	if len(in.EventId) > 0 {
		db = db.Where("e.id = ?", in.EventId)
	}
	if in.Status > 0 {
		db = db.Where("e.status = ?", in.Status)
	}

	if err := db.Order("e.start_time DESC").Find(&out.Data).Error; err != nil {
		return err
	}

	return nil
}

func (r *MySqlRepository) GetUserSwaps(ctx context.Context, in *pb.UserSwapRequest, out *pb.UserSwapResponse) error {
	db := r.Database.Table("user_badge_swap swap").
		Select(`
			swap.id,
			swap.city,
			swap.content,
			swap.status,
			swap.create_time,
			swap.expired_time,
			user.id AS user_id,
			user.wechat_name AS user_name,
			user.wechat_avatar AS user_avatar,
			in_badge.id AS in_badge_id,
			in_badge.name AS in_badge_name,
			in_badge.images AS in_badge_images,
			out_badge.id AS out_badge_id,
			out_badge.name AS out_badge_name,
			out_badge.images AS out_badge_images
		`).
		Joins("INNER JOIN user ON swap.`from` = user.id").
		Joins("INNER JOIN badge in_badge ON swap.in_badge = in_badge.id").
		Joins("INNER JOIN badge out_badge ON swap.out_badge = out_badge.id")
	if len(in.Id) > 0 {
		db = db.Where("swap.id = ?", in.Id)
	}
	if len(in.UserId) > 0 {
		db = db.Where("swap.`from`= ?", in.UserId)
	}
	if len(in.EventId) > 0 {
		db = db.Where("swap.event_id = ?", in.EventId)
	}
	if in.Status > 0 {
		db = db.Where("swap.status = ?", in.Status)
		if in.Status == 1 {
			db = db.Where("swap.expired_time >= ?", time.Now().Unix())
		}
	}
	if len(in.City) > 0 {
		db = db.Where("swap.city LIKE ?", "%"+in.City+"%")
	}

	if err := db.Order("swap.create_time DESC").Find(&out.Data).Error; err != nil {
		return err
	}

	return nil
}

func (r *MySqlRepository) CreateUserSwap(ctx context.Context, in *pb.CreateUserSwapRequest, out *pb.UserSwapResponse) error {
	if err := r.Database.Table("user_badge_swap").Create(&in).Error; err != nil {
		return err
	}

	return nil
}

func (r *MySqlRepository) UpdateUserSwap(ctx context.Context, in *pb.UpdateUserSwapRequest, out *pb.UserSwapResponse) error {
	if err := r.Database.Table("user_badge_swap").Updates(&in).Error; err != nil {
		return err
	}

	return nil
}

func (r *MySqlRepository) GetEventSettings(ctx context.Context, in *pb.EventSettingsRequest, out *pb.EventSettingsResponse) error {
	dest := struct {
		Settings *pb.EventSettings `gorm:"serializer:json"`
	}{}
	if err := r.Database.Table("event").Select("settings").Where("id = ?", in.Id).First(&dest).Error; err != nil {
		logger.Infof("%T, %v", err, err)
		logger.Error(err)
		return nil
	}
	out.Data = dest.Settings
	return nil
}

func (r *MySqlRepository) UpdateEventSettings(ctx context.Context, in *pb.UpdateEventSettingsRequest, out *pb.EventSettingsResponse) error {
	dest := struct {
		Settings *pb.EventSettings `gorm:"serializer:json"`
	}{
		Settings: in.Data,
	}
	if err := r.Database.Table("event").Where("id = ?", in.Id).Updates(dest).Error; err != nil {
		return err
	}
	out.Data = dest.Settings
	return nil
}

func (r *MySqlRepository) CreateEventAward(ctx context.Context, in *pb.CreateEventAwardRequest, out *pb.EventAwardResponse) error {
	data := make([]*pb.EventAward, len(in.Codes))
	createTime := int32(time.Now().Unix())
	for i, code := range in.Codes {
		data[i] = &pb.EventAward{
			Id:            uuid.NewV4().String(),
			EventId:       in.EventId,
			SceneryspotId: in.SceneryspotId,
			Code:          code,
			CreateTime:    createTime,
		}
	}
	if err := r.Database.Table("event_award").
		Omit("user_id", "location", "award_time").
		Create(&data).Error; err != nil {
		return err
	}
	out.Data = data
	return nil
}

func (r *MySqlRepository) GetEventAwards(ctx context.Context, in *pb.EventAwardRequest, out *pb.EventAwardResponse) error {
	db := r.Database.Table("event_award")
	if len(in.UserId) > 0 {
		db = db.Where("user_id = ?", in.UserId)
	}
	if len(in.EventId) > 0 {
		db = db.Where("event_id = ?", in.EventId)
	}
	if len(in.SceneryspotId) > 0 {
		db = db.Where("sceneryspot_id = ?", in.SceneryspotId)
	}
	if len(in.Code) > 0 {
		db = db.Where("code = ?", in.Code)
	}
	if err := db.Order("code").Find(&out.Data).Error; err != nil {
		return err
	}
	return nil
}

func (r *MySqlRepository) UpdateEventAward(ctx context.Context, in *pb.EventAward, out *pb.EventAwardResponse) error {
	db := r.Database.Table("event_award").Where("id = ?", in.Id)
	if err := db.Updates(&in).Error; err != nil {
		return err
	}
	if err := db.Find(&out.Data).Error; err != nil {
		return err
	}
	return nil
}

func (r *MySqlRepository) DeleteEventAward(ctx context.Context, in *pb.DeleteEventAwardRequest, out *pb.EventAwardResponse) error {
	db := r.Database.Table("event_award")
	if err := db.Where("id IN ?", in.Values).Find(&out.Data).Error; err != nil {
		return err
	}
	awards := make([]*pb.EventAward, len(in.Values))
	for i, id := range in.Values {
		awards[i] = &pb.EventAward{Id: id}
	}
	if err := db.Delete(&awards).Error; err != nil {
		out.Data = nil
		return err
	}
	return nil
}

func (r *MySqlRepository) GetNewEventAwards(ctx context.Context, in *pb.NewEventAwardRequest, out *pb.EventAwardResponse) error {
	limit := int(in.Count)
	db := r.Database.Table("event_award")
	if err := db.Where("event_id = ? AND sceneryspot_id = ?", in.EventId, in.SceneryspotId).Where("user_id IS NULL").
		Order("id").
		Limit(limit).
		Find(&out.Data).Error; err != nil {
		return err
	}
	return nil
}

func (r *MySqlRepository) UnbindUserPassport(ctx context.Context, in *pb.EsKeyword, out *pb.UserPassportsRes) error {
	db := r.Database.Table("user_passport")
	if err := db.Where("id = ?", in.Value).Find(&out.Data).Error; err != nil {
		return err
	}
	fmt.Println(out.Data)
	if len(out.Data) > 0 && len(out.Data[0].PassportCode) > 0 {
		r.UpdatePassportByCode(ctx, &pb.Passport{Code: out.Data[0].PassportCode, Status: 0})
	}

	values := map[string]interface{}{
		"passport_code": "",
		"user_camp_id":  "",
		"status":        0,
		"claim_code":    "",
		"claim_by":      "",
		"claim_time":    0,
	}
	if err := db.Where("id = ?", in.Value).Updates(values).Error; err != nil {
		out.Data = []*pb.UserPassport{}
		return err
	}

	return nil
}

func (r *MySqlRepository) DeleteUserPassport(ctx context.Context, in *pb.EsKeyword, out *pb.UserPassportsRes) error {
	db := r.Database.Table("user_passport")

	m := struct {
		PassportCode string
	}{}
	if err := db.Select("passport_code").Where("id = ?", in.Value).First(&m).Error; err != nil {
		out.Data = []*pb.UserPassport{}
		return err
	}

	if err := db.Delete(&pb.UserPassport{Id: in.Value}).Error; err != nil {
		out.Data = []*pb.UserPassport{}
		return err
	}

	if len(m.PassportCode) > 0 {
		r.UpdatePassportByCode(ctx, &pb.Passport{Code: m.PassportCode, Status: 0})
	}

	return nil
}

func (r *MySqlRepository) UpdateUserStampCount(ctx context.Context, in *pb.UserStampCountRequest, out *pb.UserStampCountResponse) error {
	db := r.Database.Table("user_camp").Where(&pb.UserCamp{UserId: in.UserId, EventId: in.EventId})
	if err := db.Update("stamp_count", in.Value).Error; err != nil {
		return err
	}
	out.Data = in.Value

	return nil
}

func (r *MySqlRepository) IncrementUserStampCount(ctx context.Context, in *pb.UserStampCountRequest, out *pb.UserStampCountResponse) error {
	db := r.Database
	if err := db.Table("user_camp").
		Where(&pb.UserCamp{UserId: in.UserId, EventId: in.EventId}).
		Update("stamp_count", gorm.Expr("stamp_count + ?", in.Value)).
		Error; err != nil {
		return err
	}

	v := struct {
		StampCount int32
	}{}
	if err := db.Table("user_camp").Where(&pb.UserCamp{UserId: in.UserId, EventId: in.EventId}).
		Select("stamp_count").
		First(&v).Error; err != nil {
		return err
	}
	out.Data = v.StampCount

	return nil
}

func (r *MySqlRepository) GetExportPassports(ctx context.Context, in *pb.ExportPassportRequest, out *pb.ExportPassportResponse) error {
	fields := []string{
		"p.code",
		"p.status",
		"up.real_name",
		"up.nric",
		"up.phone",
		"up.gender",
		"up.profession",
		"up.guardian_name",
		"up.guardian_nric",
		"up.guardian_phone",
		"claim.wechat_name AS claim_by",
		"up.claim_time",
	}
	err := r.Database.Table("passport p ").
		Joins("INNER JOIN user_passport up on p.code = up.passport_code").
		Joins("INNER JOIN user claim on up.claim_by = claim.id").
		Select(fields).
		Order("up.claim_time").
		Find(&out.Data).Error
	if err != nil {
		return err
	}
	return nil
}
