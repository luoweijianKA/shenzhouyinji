package repository

import (
	"context"
	"errors"
	"strings"

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
