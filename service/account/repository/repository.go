package repository

import (
	"context"
	"errors"
	"time"

	uuid "github.com/satori/go.uuid"
	pb "gitlab.com/annoying-orange/shenzhouyinji/service/account/proto"
	"gorm.io/gorm"
)

const StatusDelete = 4

var (
	ErrNotRecord = errors.New("record not found")
)

type Repository interface {
	CreateAccount(ctx context.Context, item *pb.Account) (*pb.AsKeyword, error)
	UpdateAccount(ctx context.Context, in *pb.Account) (*pb.AsRes, error)
	GetAccount(ctx context.Context, req *pb.AsKeyword) (*pb.Account, error)
	GetAccounts(ctx context.Context, in *pb.AccountRequest, out *pb.AccountResponse) error
	DeleteAccount(ctx context.Context, in *pb.AsKeyword, out *pb.AccountResponse) error

	UpdateProfile(ctx context.Context, item *pb.Profile) (*pb.AsRes, error)
	GetProfileByUserID(ctx context.Context, req *pb.AsKeyword) (*pb.Profile, error)
	GetProfileByName(ctx context.Context, req *pb.AsKeyword) (*pb.Profile, error)

	CreateClaimCode(ctx context.Context, item *pb.ClaimCode) (*pb.AsKeyword, error)
	UpdateClaimCode(ctx context.Context, item *pb.ClaimCode) (*pb.AsRes, error)
	GetClaimCodeByUserID(ctx context.Context, req *pb.AsKeyword) (*pb.ClaimCode, error)

	Login(ctx context.Context, req *pb.LoginReq) (*pb.LoginRes, error)
	LoginWithWechat(ctx context.Context, req *pb.WechatReq) (*pb.LoginRes, error)
	UpdatePassword(ctx context.Context, req *pb.PasswordReq) (*pb.AsRes, error)

	// IndivIdentity
	CreateIndivIdentity(ctx context.Context, in *pb.IndivIdentity, out *pb.IndivIdentityResponse) error
	GetIndivIdentity(ctx context.Context, in *pb.IndivIdentityRequest, out *pb.IndivIdentityResponse) error
	GetIndivIdentityAccount(ctx context.Context, in *pb.IndivIdentityAccountRequest, out *pb.IndivIdentityAccountResponse) error
	DeleteIndivIdentity(ctx context.Context, in *pb.IndivIdentityRequest, out *pb.IndivIdentityResponse) error

	GetUserPoints(ctx context.Context, in *pb.UserPointsRequest, out *pb.UserPointsResponse) error
	AddUserPoints(ctx context.Context, in *pb.UserPoints, out *pb.UserPointsResponse) error

	GetExportUsers(ctx context.Context, in *pb.ExportUserRequest, out *pb.ExportUserResponse) error
}

type MySqlRepository struct {
	Database *gorm.DB
}

func (r *MySqlRepository) CreateAccount(ctx context.Context, item *pb.Account) (*pb.AsKeyword, error) {

	account := new(pb.Account)
	r.Database.Table("user").Where("login_id = ?", item.LoginId).First(&account)
	if account.Id != "" {
		return nil, errors.New("loginid already exists")
	}

	item.Id = uuid.NewV4().String()
	item.CreateTime = int32(time.Now().Unix())
	item.Status = 1

	if err := r.Database.Table("user").Create(&item).Error; err != nil {
		return nil, err
	}

	syncProfile(item.Id, r)
	return &pb.AsKeyword{Value: item.Id}, nil
}

func syncProfile(user_id string, r *MySqlRepository) error {
	profile := pb.Profile{
		Id:         user_id,
		CreateTime: int32(time.Now().Unix()),
	}

	if err := r.Database.Table("user_profile").Create(&profile).Error; err != nil {
		return err
	}

	return nil
}

func (r *MySqlRepository) UpdateAccount(ctx context.Context, in *pb.Account) (*pb.AsRes, error) {
	db := r.Database.Table("user")
	if in.Status == StatusDelete {
		if err := db.Delete(&pb.Account{}, "id = ?", in.Id).Error; err != nil {
			return nil, err
		}
		return &pb.AsRes{Value: true}, nil
	}

	if err := db.Where("id = ?", in.Id).Updates(pb.Account{
		Password:     in.Password,
		WechatName:   in.WechatName,
		WechatAvatar: in.WechatAvatar,
		Role:         in.Role,
		Scopes:       in.Scopes,
		Status:       in.Status,
	}).Error; err != nil {
		return nil, err
	}

	return &pb.AsRes{Value: true}, nil
}

func (r *MySqlRepository) UpdateProfile(ctx context.Context, item *pb.Profile) (*pb.AsRes, error) {
	if err := r.Database.Table("user_profile").Where("id = ?", item.Id).Updates(pb.Profile{
		Name:           item.Name,
		Gender:         item.Gender,
		Age:            item.Age,
		Birthday:       item.Birthday,
		Email:          item.Email,
		Phone:          item.Phone,
		City:           item.City,
		Tags:           item.Tags,
		Nric:           item.Nric,
		Authentication: item.Authentication,
		Profession:     item.Profession,
		GuardianName:   item.GuardianName,
		GuardianNric:   item.GuardianNric,
		GuardianPhone:  item.GuardianPhone,
	}).Error; err != nil {
		return nil, err
	}

	return &pb.AsRes{Value: true}, nil
}

func (r *MySqlRepository) GetAccount(ctx context.Context, req *pb.AsKeyword) (*pb.Account, error) {

	account := new(pb.Account)

	if err := r.Database.Table("user").Where("id = ?", req.Value).First(&account).Error; err != nil {
		return nil, err
	}

	return account, nil
}

func (r *MySqlRepository) GetAccounts(ctx context.Context, in *pb.AccountRequest, out *pb.AccountResponse) error {
	db := r.Database.Table("user")
	if len(in.Roles) > 0 {
		db = db.Where("role IN ?", in.Roles)
	}
	if len(in.Search) > 0 {
		db = db.Where("wechat_name LIKE ?", "%"+in.Search+"%")
	}

	if err := db.Order("create_time DESC").Find(&out.Data).Error; err != nil {
		return err
	}
	return nil
}

func (r *MySqlRepository) DeleteAccount(ctx context.Context, in *pb.AsKeyword, out *pb.AccountResponse) error {
	if err := r.Database.Table("user").Where("id = ?", in.Value).Find(&out.Data).Error; err != nil {
		return err
	}

	if err := r.Database.Exec("CALL del_user(?)", in.Value).Error; err != nil {
		return err
	}

	return nil
}

func (r *MySqlRepository) GetProfileByUserID(ctx context.Context, req *pb.AsKeyword) (*pb.Profile, error) {
	profile := new(pb.Profile)

	if err := r.Database.Table("user_profile").Where("id = ?", req.Value).First(&profile).Error; err != nil {
		return nil, err
	}

	return profile, nil
}

func (r *MySqlRepository) GetProfileByName(ctx context.Context, req *pb.AsKeyword) (*pb.Profile, error) {
	profile := new(pb.Profile)

	if err := r.Database.Table("user_profile").Where("name = ?", req.Value).First(&profile).Error; err != nil {
		return nil, err
	}

	return profile, nil
}

func (r *MySqlRepository) CreateClaimCode(ctx context.Context, item *pb.ClaimCode) (*pb.AsKeyword, error) {

	claimCode := new(pb.ClaimCode)
	r.Database.Table("user_claim_code").Where("user_id = ?", item.UserId).First(&claimCode)
	if claimCode.Id != "" {
		return nil, errors.New("claim code already exists")
	}

	item.Id = uuid.NewV4().String()
	item.CreateTime = int32(time.Now().Unix())
	item.Status = 1

	if err := r.Database.Table("user_claim_code").Create(&item).Error; err != nil {
		return nil, err
	}

	return &pb.AsKeyword{Value: item.Id}, nil
}

func (r *MySqlRepository) UpdateClaimCode(ctx context.Context, item *pb.ClaimCode) (*pb.AsRes, error) {
	if err := r.Database.Table("user_claim_code").Where("id = ?", item.Id).Updates(pb.ClaimCode{
		Code:   item.Code,
		Status: item.Status,
	}).Error; err != nil {
		return nil, err
	}

	return &pb.AsRes{Value: true}, nil
}

func (r *MySqlRepository) GetClaimCodeByUserID(ctx context.Context, req *pb.AsKeyword) (*pb.ClaimCode, error) {
	claimCode := new(pb.ClaimCode)

	if err := r.Database.Table("user_claim_code").Where("user_id = ?", req.Value).First(&claimCode).Error; err != nil {
		return nil, err
	}

	return claimCode, nil
}

func (r *MySqlRepository) Login(ctx context.Context, req *pb.LoginReq) (*pb.LoginRes, error) {
	account := new(pb.Account)

	if err := r.Database.Table("user").Where("login_id = ? and password = ?", req.LoginId, req.Password).First(&account).Error; err != nil {
		return nil, err
	}
	if account.Status != 1 {
		return nil, errors.New("account suspended")
	}

	return &pb.LoginRes{Id: account.Id, LoginId: account.LoginId, Role: account.Role}, nil
}

func (r *MySqlRepository) LoginWithWechat(ctx context.Context, req *pb.WechatReq) (*pb.LoginRes, error) {
	account := new(pb.Account)

	if err := r.Database.Table("user").Where("wechat = ?", req.Wechat).First(&account).Error; err != nil {
		account.Id = uuid.NewV4().String()
		account.CreateTime = int32(time.Now().Unix())
		account.Status = 1
		account.Role = "USER"
		account.Scopes = "[]"
		account.Wechat = req.Wechat

		if err := r.Database.Table("user").Create(&account).Error; err != nil {
			return nil, err
		}

		syncProfile(account.Id, r)
	}

	r.Database.Table("user").Save(&account)

	return &pb.LoginRes{Id: account.Id, LoginId: account.LoginId, Role: account.Role}, nil
}

func (r *MySqlRepository) UpdatePassword(ctx context.Context, req *pb.PasswordReq) (*pb.AsRes, error) {
	u := struct{ ID string }{}
	if err := r.Database.Table("user").Select("id").Where("id = ? AND password = ?", req.LoginId, req.OldPassword).
		First(&u).Error; err != nil {
		return nil, err
	}

	if err := r.Database.Table("user").Where("id = ?", u.ID).Updates(pb.Account{Password: req.NewPassword}).
		Error; err != nil {
		return nil, err
	}

	return &pb.AsRes{Value: true}, nil
}

func (r *MySqlRepository) CreateIndivIdentity(ctx context.Context, in *pb.IndivIdentity, out *pb.IndivIdentityResponse) error {
	db := r.Database
	if err := db.Table("user_indivIdentity").Create(&in).Error; err != nil {
		return err
	}
	out.Data = in

	return nil
}

func (r *MySqlRepository) GetIndivIdentity(ctx context.Context, in *pb.IndivIdentityRequest, out *pb.IndivIdentityResponse) error {
	db := r.Database
	if err := db.Table("user_indivIdentity").First(&out.Data, "id = ?", in.Id).Error; err != nil {
		if err.Error() == ErrNotRecord.Error() {
			out.Data = nil
			return nil
		}
		return err
	}

	return nil
}

func (r *MySqlRepository) GetIndivIdentityAccount(ctx context.Context, in *pb.IndivIdentityAccountRequest, out *pb.IndivIdentityAccountResponse) error {
	db := r.Database.Table("user_indivIdentity")
	if err := db.Select("account_id").Order("create_time").First(&out.Data, "user_id = ?", in.UserId).Error; err != nil {
		if err.Error() == ErrNotRecord.Error() {
			out.Data = nil
			return nil
		}
		return err
	}

	return nil
}

func (r *MySqlRepository) DeleteIndivIdentity(ctx context.Context, in *pb.IndivIdentityRequest, out *pb.IndivIdentityResponse) error {
	db := r.Database
	if err := db.Table("user_indivIdentity").Delete(&pb.IndivIdentity{}, "id = ?", in.Id).Error; err != nil {
		return err
	}
	out.Data = nil

	return nil
}

func (r *MySqlRepository) GetUserPoints(ctx context.Context, in *pb.UserPointsRequest, out *pb.UserPointsResponse) error {
	db := r.Database.Table("user_points").Where("user_id = ?", in.UserId)
	if len(in.EventId) > 0 {
		db = db.Where("event_id = ?", in.EventId)
	}
	if in.Timestamp > 0 {
		db = db.Where("create_time >= ?", in.Timestamp)
	}
	if err := db.Order("create_time DESC").Find(&out.Data).Error; err != nil {
		return err
	}

	return nil
}

func (r *MySqlRepository) AddUserPoints(ctx context.Context, in *pb.UserPoints, out *pb.UserPointsResponse) error {
	in.Id = uuid.NewV4().String()
	in.CreateTime = int32(time.Now().Unix())

	if err := r.Database.Table("user_points").Create(&in).Error; err != nil {
		return err
	}
	out.Data = []*pb.UserPoints{in}
	return nil
}

func (r *MySqlRepository) GetExportUsers(ctx context.Context, in *pb.ExportUserRequest, out *pb.ExportUserResponse) error {
	fields := []string{
		"u.id",
		"u.login_id",
		"u.role",
		"u.wechat",
		"u.wechat_name",
		"u.wechat_avatar",
		"u.status",
		"u.scopes",
		"u.create_time",
		"up.name",
		"up.gender",
		"up.age",
		"up.birthday",
		"up.email",
		"up.phone",
		"up.city",
		"up.tags",
		"up.nric",
		"up.authentication",
		"up.profession",
		"up.guardian_name",
		"up.guardian_nric",
		"up.guardian_phone",
	}
	db := r.Database.Table("user u").Joins("INNER JOIN  user_profile up on u.id = up.id").Select(fields)
	if len(in.Roles) > 0 {
		db = db.Where("u.role IN ?", in.Roles)
	}
	if len(in.Search) > 0 {
		db = db.Where("u.wechat_name LIKE ?", "%"+in.Search+"%")
	}

	if err := db.Order("u.create_time DESC").Find(&out.Data).Error; err != nil {
		return err
	}
	return nil
}
