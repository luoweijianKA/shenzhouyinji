package resolver

import (
	"context"
	"encoding/base64"
	"encoding/csv"
	"encoding/json"
	"errors"
	"fmt"
	"math/rand"
	"os"
	"strings"
	"time"

	"gateway/graph/auth"
	"gateway/graph/model"
	"gateway/weixin"

	"github.com/gofrs/uuid"
	aPB "gitlab.com/annoying-orange/shenzhouyinji/service/account/proto"
	ePB "gitlab.com/annoying-orange/shenzhouyinji/service/event/proto"
	mPB "gitlab.com/annoying-orange/shenzhouyinji/service/management/proto"
	msgPB "gitlab.com/annoying-orange/shenzhouyinji/service/message/proto"
	sPB "gitlab.com/annoying-orange/shenzhouyinji/service/sceneryspot/proto"
	tPB "gitlab.com/annoying-orange/shenzhouyinji/service/task/proto"
	merr "go-micro.dev/v4/errors"
	"go-micro.dev/v4/logger"
	"go.mongodb.org/mongo-driver/mongo"
)

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

var (
	ErrNoRecord           = errors.New("record not found")
	ErrExistsNricAndPhone = errors.New("nric and phone already exist")
	ErrExistsNric         = errors.New("nric already exist")
	ErrExistsPhone        = errors.New("phone already exist")
	ErrInvalidUser        = errors.New("invalid user")
	ErrNotCamp            = errors.New("请选择阵营，如有疑问请联系微信客服")
)

type TaskStatus int32

const (
	TaskStatusPendding  TaskStatus = 1
	TaskStatusCompleted TaskStatus = 2
	TaskStatusRedone    TaskStatus = 3
	TaskStatusVoided    TaskStatus = 4
)

type TaskCategory string

const (
	TaskCategoryTrek       TaskCategory = "95e1fa0f-40b5-4ae9-84ec-4e65c24e7f7d"
	TaskCategoryQuestion   TaskCategory = "0db57a33-ab01-449c-961b-2c1015f35496"
	TaskCategoryGeocaching TaskCategory = "00e19ddf-6af6-4d8a-889f-a4dc6a030c02"
	TaskCategoryScreenshot TaskCategory = "62127eeb-29b7-461a-a065-ae62cc5201aa"
	TaskCategoryPuzzle     TaskCategory = "d64b951d-1c06-4254-b88b-4a0459caac4d"
)

type AuditingCode string

const (
	AuditingCodeConfigs      AuditingCode = "CONFIGS"
	AuditingCodeNotification AuditingCode = "NOTIFICATION"
	AuditingCodeAccount      AuditingCode = "ACCOUNT"
	AuditingCodeEvent        AuditingCode = "EVENT"
	AuditingCodeUserPoints   AuditingCode = "USER_POINTS"
)

type Menu string

const (
	MenuTask  Menu = "4"
	MenuShare Menu = "5"
)

type Message string

const (
	MessageFromSystem          Message = "0"
	MessageFromCustomerService         = "1"
	MessageFromReward                  = "2"
)

const ResourceDir = "resources"

type Resolver struct {
	DB                 *mongo.Database
	WX                 *weixin.API
	accountService     aPB.AccountService
	sceneryspotService sPB.SceneryspotService
	taskService        tPB.TaskService
	messageService     msgPB.MessagesService
	managementService  mPB.ManagementService
	eventService       ePB.EventService
}

func NewResolver(db *mongo.Database, wx *weixin.API, aSrv aPB.AccountService, sSrv sPB.SceneryspotService, tSrv tPB.TaskService, mSrv mPB.ManagementService, msgSrv msgPB.MessagesService, eSrv ePB.EventService) *Resolver {
	r := Resolver{
		DB:                 db,
		WX:                 wx,
		accountService:     aSrv,
		sceneryspotService: sSrv,
		taskService:        tSrv,
		messageService:     msgSrv,
		managementService:  mSrv,
		eventService:       eSrv,
	}

	return &r
}

func NewID() string {
	return uuid.Must(uuid.NewV4()).String()
}

func NotNilString(v *string, defaultValue string) string {
	if v == nil {
		return defaultValue
	}
	return *v
}

func NotNilInt(v *int, defaultValue int) int {
	if v == nil {
		return defaultValue
	}
	return *v
}

func NotNilBool(v *bool, defaultValue bool) bool {
	if v == nil {
		return defaultValue
	}
	return *v
}

func EncodeToCursor(v string) string {
	return base64.StdEncoding.EncodeToString([]byte(v))
}

func DecodedCursor(v *string) (string, error) {
	var cursor string
	if v != nil {
		b, err := base64.StdEncoding.DecodeString(*v)
		if err != nil {
			return "", err
		}
		cursor = string(b)
	}

	return cursor, nil
}

func NoRecordErr(err error) bool {
	return merr.Parse(err.Error()).Detail == ErrNoRecord.Error()
}

func NoAnyPassportActivated(passports []*ePB.UserEventPassport) bool {
	if passports == nil || len(passports) == 0 {
		return true
	}

	for _, v := range passports {
		if v.Status > 0 {
			return false
		}
	}

	return true
}

func IsAdmin(acc *aPB.Account) bool {
	if acc != nil {
		return acc.Role == model.RoleAdmin.String() || acc.Role == model.RoleRoot.String()
	}
	return false
}

func WriteCSV(name string, records [][]string) error {
	file, err := os.Create(name)
	if err != nil {
		return err
	}
	defer file.Close()

	w := csv.NewWriter(file)
	// add utfbom mark
	w.Write([]string{string([]byte{0xEF, 0xBB, 0xBF})})
	w.WriteAll(records)
	w.Flush()

	return nil
}

func (r *Resolver) newResult(success bool, msg string) (*model.Result, error) {
	return &model.Result{Succed: &success, Message: &msg}, nil
}

func (r *Resolver) NewAccount(v *aPB.Account) *model.Account {
	var scopes []string
	if len(v.Scopes) > 0 {
		json.Unmarshal([]byte(v.Scopes), &scopes)
	}
	return &model.Account{
		ID:           v.Id,
		LoginID:      v.LoginId,
		Wechat:       &v.Wechat,
		WechatName:   &v.WechatName,
		WechatAvatar: &v.WechatAvatar,
		Role:         model.Role(v.Role),
		Scopes:       scopes,
		Status:       int(v.Status),
		CreateTime:   int(v.CreateTime),
	}
}

func (r *Resolver) NewPassport(v *ePB.Passport) *model.Passport {
	return &model.Passport{
		ID:            v.Id,
		PassportSetID: v.PassportSetId,
		Code:          v.Code,
		Status:        int(v.Status),
	}
}

func (r *Resolver) NewUserPassport(v *ePB.UserPassport) *model.UserPassport {
	return &model.UserPassport{
		ID:             v.Id,
		UserID:         v.UserId,
		EventID:        v.EventId,
		CampID:         &v.UserCampId,
		PassportCode:   &v.PassportCode,
		RealName:       &v.RealName,
		Nric:           &v.Nric,
		Phone:          &v.Phone,
		Gender:         &v.Gender,
		Profession:     &v.PassportCode,
		Authentication: &v.Authentication,
		GuardianName:   &v.GuardianName,
		GuardianNric:   &v.GuardianNric,
		GuardianPhone:  &v.GuardianPhone,
		ClaimCode:      &v.ClaimCode,
		ClaimBy:        &v.ClaimBy,
		ClaimTime:      int(v.ClaimTime),
		Status:         int(v.Status),
		CreateTime:     int(v.CreateTime),
	}
}

func (r *Resolver) NewEvent(v *ePB.Event) *model.Event {
	ct := int(v.CreateTime)
	return &model.Event{
		ID:           v.Id,
		Code:         v.Code,
		Name:         v.Name,
		StartTime:    int(v.StartTime),
		EndTime:      int(v.EndTime),
		Introduction: &v.Introduction,
		Images:       &v.Images,
		Step:         &v.Step,
		Status:       int(v.Status),
		CreateTime:   &ct,
	}
}

func (r *Resolver) NewPhoto(v *msgPB.Tweet, account *aPB.Account, sceneryspot *model.Sceneryspot) *model.Photo {
	content := struct {
		Text   string
		Images []string
	}{}

	if err := json.Unmarshal([]byte(v.Content), &content); err != nil {
		logger.Error(err)
	}

	var author, avatar string
	if account != nil {
		author = account.WechatName
		avatar = account.WechatAvatar
	}

	return &model.Photo{
		ID:          v.Id,
		Author:      author,
		Avatar:      avatar,
		Pics:        content.Images,
		Content:     content.Text,
		Timestamp:   int(v.CreateTime),
		Location:    &v.Location,
		Region:      &v.Region,
		Sceneryspot: sceneryspot,
	}
}

func (r *Resolver) NewAuditing(v *mPB.Auditing) *model.Auditing {
	data := make(map[string]interface{})
	if len(v.Data) > 0 {
		if err := json.Unmarshal([]byte(v.Data), &data); err != nil {
			logger.Error(err)
		}
	}

	return &model.Auditing{
		ID:          v.Id,
		Code:        v.Code,
		Message:     v.Message,
		Data:        data,
		CreatedBy:   v.CreatedBy,
		CreatedTime: int(v.CreatedTime),
	}
}

func (r *Resolver) NewTideSpot(v *mPB.TideSpot) *model.TideSpot {
	ct := int(v.CreateTime)
	ut := int(v.UpdateTime)
	status := int(v.Status)
	return &model.TideSpot{
		ID:                v.Id,
		Name:              v.Name,
		PositionTolerance: &v.PositionTolerance,
		ElectricFence:     &v.ElectricFence,
		CreateTime:        &ct,
		UpdateTime:        &ut,
		Status:            &status,
	}
}

func (r *Resolver) auditing(ctx context.Context, code AuditingCode, msg string, v ...any) {
	uc := auth.ForContext(ctx)
	in := mPB.Auditing{
		Code:        string(code),
		Message:     msg,
		Data:        "{}",
		CreatedBy:   uc.User.LoginId,
		CreatedTime: int32(time.Now().Unix()),
	}

	if v != nil && len(v) > 0 {
		if data, err := json.Marshal(v[0]); err == nil {
			in.Data = string(data)
		}
	}
	if _, err := r.managementService.CreateAuditing(ctx, &in); err != nil {
		logger.Error(err)
	}
}

func (r *Resolver) NewEventUser(v *ePB.EventUser) *model.EventUser {
	return &model.EventUser{
		ID:         v.Id,
		UserID:     v.UserId,
		UserName:   v.UserName,
		UserWechat: v.UserWechat,
		CampID:     v.CampId,
		CampName:   v.CampName,
		Points:     int(v.Points),
		Trips:      int(v.StampCount),
		City:       v.City,
		Email:      v.Email,
		Phone:      v.Phone,
	}
}

func (r *Resolver) NewUserTask(v *tPB.UserTask) *model.UserTask {
	return &model.UserTask{
		ID:            v.Id,
		UserID:        v.UserId,
		EventID:       v.EventId,
		CampID:        v.CampId,
		SceneryspotID: v.SceneryspotId,
		TaskID:        v.TaskId,
		TaskCategory:  v.TaskCategory,
		Result:        v.Result,
		Points:        int(v.Points),
		Status:        int(v.Status),
		Audit:         &v.Audit,
		CreateTime:    int(v.CreateTime),
	}
}

func (r *Resolver) NewUserSwap(v *ePB.UserSwap) *model.UserSwap {
	status := int(v.Status)
	expiredTime := int(v.ExpiredTime)
	now := int(time.Now().Unix())

	if status == 1 && expiredTime < now {
		status = 3
	}

	content := []map[string]interface{}{}
	if len(v.Content) > 0 {
		json.Unmarshal([]byte(v.Content), &content)
	}

	return &model.UserSwap{
		ID:         v.Id,
		UserID:     v.UserId,
		UserName:   v.UserName,
		UserAvatar: v.UserAvatar,
		Badges: []*model.Badge{
			{ID: v.OutBadgeId, Name: v.OutBadgeName, Images: &v.OutBadgeImages},
			{ID: v.InBadgeId, Name: v.InBadgeName, Images: &v.InBadgeImages},
		},
		City:        &v.City,
		Content:     content,
		Status:      status,
		CreateTime:  int(v.CreateTime),
		ExpiredTime: expiredTime,
	}
}

func (r *Resolver) NewUserPoints(v *aPB.UserPoints) *model.UserPoints {
	return &model.UserPoints{
		ID:         v.Id,
		UserID:     v.UserId,
		Content:    v.Content,
		Op:         v.Op,
		Points:     int(v.Points),
		CreateTime: int(v.CreateTime),
	}
}

func (r *Resolver) NewEventAward(v *ePB.EventAward) *model.EventAward {
	var userID, eventID, sceneryspotID, location *string
	var awardTime *int
	if len(v.UserId) > 0 {
		userID = &v.UserId
	}
	if len(v.EventId) > 0 {
		eventID = &v.EventId
	}
	if len(v.SceneryspotId) > 0 {
		sceneryspotID = &v.SceneryspotId
	}
	if len(v.Location) > 0 {
		location = &v.Location
	}
	if v.AwardTime > 0 {
		time := int(v.AwardTime)
		awardTime = &time
	}
	return &model.EventAward{
		ID:            v.Id,
		EventID:       eventID,
		SceneryspotID: sceneryspotID,
		Code:          v.Code,
		CreateTime:    int(v.CreateTime),
		UserID:        userID,
		Location:      location,
		AwardTime:     awardTime,
	}
}

func (r *Resolver) NewClaimPassport(v *ePB.UserEventPassport, account *aPB.Account) *model.ClaimPassport {
	var userName, userAvatar string
	if account != nil {
		userName = account.WechatName
		userAvatar = account.WechatAvatar
	}

	return &model.ClaimPassport{
		ID:           v.Id,
		UserID:       v.UserId,
		UserName:     userName,
		UserAvatar:   userAvatar,
		EventID:      v.EventId,
		PassportCode: v.PassportCode,
		ClaimBy:      v.ClaimBy,
		ClaimTime:    int(v.ClaimTime),
		Status:       int(v.Status),
	}
}

func (r *Resolver) getUserCamp(ctx context.Context, userID, eventID string) (*ePB.Camp, error) {
	out, err := r.eventService.GetCampWithUser(ctx, &ePB.CampWithUserRequest{UserId: userID, EventId: eventID})
	if err != nil {
		return nil, err
	}
	if len(out.Data) == 0 {
		return nil, nil
	}

	return out.Data[0], nil
}

func (r *Resolver) getTreks(ctx context.Context, categoryID string, sceneryspotID string, completedTask func(id string) *tPB.UserTask) ([]model.Task, error) {
	category, err := r.managementService.GetCategoryByID(ctx, &mPB.MsKeyword{Value: string(TaskCategoryTrek)})
	if err != nil {
		return nil, err
	}
	if category == nil {
		return []model.Task{}, nil
	}

	out, err := r.taskService.GetTrekBySceneryspotID(ctx, &tPB.TsKeyword{Value: sceneryspotID})
	if err != nil {
		return nil, err
	}
	data := out.Data
	result := make([]model.Task, len(data))
	for i, v := range data {
		timestamp := int(time.Now().Unix())
		var redone, completed bool
		if task := completedTask(v.Id); task != nil {
			timestamp = int(task.CreateTime)
			redone = len(task.Audit) == 0 && task.Result != fmt.Sprintf("%v", v.Step)
			completed = task.Status == int32(TaskStatusCompleted)
		}
		result[i] = &model.TrekTask{
			ID:            v.Id,
			Name:          v.Name,
			CategoryID:    category.Id,
			CategoryName:  category.Name,
			Points:        int(v.Points),
			Optional:      categoryID != category.Id,
			Status:        int(v.Status),
			Timestamp:     timestamp,
			Redone:        &redone,
			Completed:     &completed,
			Step:          int(v.Step),
			Introduction:  v.Introduction,
			ElectricFence: &v.ElectricFence,
		}
	}

	return result, nil
}

func (r *Resolver) getTrekTasks(ctx context.Context, categoryID string, in *tPB.TaskRequest, completedTask func(id string) *tPB.UserTask) ([]model.Task, error) {
	category, err := r.managementService.GetCategoryByID(ctx, &mPB.MsKeyword{Value: string(TaskCategoryTrek)})
	if err != nil {
		return nil, err
	}
	if category == nil {
		return []model.Task{}, nil
	}

	out, err := r.taskService.GetTreks(ctx, in)
	if err != nil {
		return nil, err
	}
	data := out.Data
	result := make([]model.Task, len(data))
	for i, v := range data {
		timestamp := int(time.Now().Unix())
		var redone, completed bool
		if task := completedTask(v.Id); task != nil {
			timestamp = int(task.CreateTime)
			redone = len(task.Audit) == 0 && task.Result != fmt.Sprintf("%v", v.Step)
			completed = task.Status == int32(TaskStatusCompleted)
		}
		result[i] = &model.TrekTask{
			ID:            v.Id,
			Name:          v.Name,
			CategoryID:    category.Id,
			CategoryName:  category.Name,
			Points:        int(v.Points),
			Optional:      categoryID != category.Id,
			Status:        int(v.Status),
			Timestamp:     timestamp,
			Redone:        &redone,
			Completed:     &completed,
			Step:          int(v.Step),
			Introduction:  v.Introduction,
			ElectricFence: &v.ElectricFence,
		}
	}

	return result, nil
}

func (r *Resolver) getQuestions(ctx context.Context, categoryID string, sceneryspotID string, completedTasks []*tPB.UserTask) ([]model.Task, error) {
	category, err := r.managementService.GetCategoryByID(ctx, &mPB.MsKeyword{Value: string(TaskCategoryQuestion)})
	if err != nil {
		return nil, err
	}
	if category == nil {
		return []model.Task{}, nil
	}

	out, err := r.taskService.GetQuestionBankBySceneryspotID(ctx, &tPB.TsKeyword{Value: sceneryspotID})
	if err != nil {
		return nil, err
	}

	size := 3
	questions := out.Data
	result := []model.Task{}

	for _, task := range completedTasks {
		for _, q := range questions {
			if task.TaskId == q.Id {
				redone := len(task.Audit) == 0 && task.Result != q.Answer
				completed := true
				result = append(
					result,
					model.QuestionTask{
						ID:            q.Id,
						Name:          q.Question,
						CategoryID:    category.Id,
						CategoryName:  category.Name,
						Points:        int(q.Points),
						Optional:      categoryID != category.Id,
						Status:        int(q.Status),
						Timestamp:     int(task.CreateTime),
						Redone:        &redone,
						Completed:     &completed,
						ElectricFence: &q.ElectricFence,
					},
				)
				break
			}
		}
	}

	if len(result) < size {
		rand.Seed(time.Now().UnixNano())
		rand.Shuffle(len(questions), func(i, j int) { questions[i], questions[j] = questions[j], questions[i] })

		i := 0
		for len(result) < size && i < len(questions) {
			q := questions[i]
			exists := false
			for _, r := range result {
				if r.GetID() == q.Id {
					exists = true
					break
				}
			}
			if !exists {
				redone := false
				completed := false
				result = append(
					result,
					model.QuestionTask{
						ID:            q.Id,
						Name:          q.Question,
						CategoryID:    category.Id,
						CategoryName:  category.Name,
						Points:        int(q.Points),
						Optional:      categoryID != category.Id,
						Status:        int(q.Status),
						Timestamp:     int(time.Now().Unix()),
						Redone:        &redone,
						Completed:     &completed,
						ElectricFence: &q.ElectricFence,
					},
				)
			}
			i += 1
		}
	}

	return result, nil
}

func (r *Resolver) getQuestionTasks(ctx context.Context, categoryID string, in *tPB.TaskRequest, completedTasks []*tPB.UserTask) ([]model.Task, error) {
	category, err := r.managementService.GetCategoryByID(ctx, &mPB.MsKeyword{Value: string(TaskCategoryQuestion)})
	if err != nil {
		return nil, err
	}
	if category == nil {
		return []model.Task{}, nil
	}

	out, err := r.taskService.GetQuestions(ctx, in)
	if err != nil {
		return nil, err
	}

	size := 3
	questions := out.Data
	result := []model.Task{}

	for _, task := range completedTasks {
		for _, q := range questions {
			if task.TaskId == q.Id {
				redone := len(task.Audit) == 0 && task.Result != q.Answer
				completed := true
				result = append(
					result,
					model.QuestionTask{
						ID:            q.Id,
						Name:          q.Question,
						CategoryID:    category.Id,
						CategoryName:  category.Name,
						Points:        int(q.Points),
						Optional:      categoryID != category.Id,
						Status:        int(q.Status),
						Timestamp:     int(task.CreateTime),
						Redone:        &redone,
						Completed:     &completed,
						ElectricFence: &q.ElectricFence,
					},
				)
				break
			}
		}
	}

	if len(result) < size {
		rand.Seed(time.Now().UnixNano())
		rand.Shuffle(len(questions), func(i, j int) { questions[i], questions[j] = questions[j], questions[i] })

		i := 0
		for len(result) < size && i < len(questions) {
			q := questions[i]
			exists := false
			for _, r := range result {
				if r.GetID() == q.Id {
					exists = true
					break
				}
			}
			if !exists {
				redone := false
				completed := false
				result = append(
					result,
					model.QuestionTask{
						ID:            q.Id,
						Name:          q.Question,
						CategoryID:    category.Id,
						CategoryName:  category.Name,
						Points:        int(q.Points),
						Optional:      categoryID != category.Id,
						Status:        int(q.Status),
						Timestamp:     int(time.Now().Unix()),
						Redone:        &redone,
						Completed:     &completed,
						ElectricFence: &q.ElectricFence,
					},
				)
			}
			i += 1
		}
	}

	return result, nil
}

func (r *Resolver) getGeocachings(ctx context.Context, categoryID string, sceneryspotID string, completedTask func(id string) *tPB.UserTask) ([]model.Task, error) {
	category, err := r.managementService.GetCategoryByID(ctx, &mPB.MsKeyword{Value: string(TaskCategoryGeocaching)})
	if err != nil {
		return nil, err
	}
	if category == nil {
		return []model.Task{}, nil
	}

	out, err := r.taskService.GetGeocachingBySceneryspotID(ctx, &tPB.TsKeyword{Value: sceneryspotID})
	if err != nil {
		return nil, err
	}
	data := out.Data
	result := make([]model.Task, len(data))
	for i, v := range data {
		timestamp := int(time.Now().Unix())
		var redone, completed bool
		if task := completedTask(v.Id); task != nil {
			timestamp = int(task.CreateTime)
			redone = len(task.Audit) == 0 && task.Result != v.Id
			completed = true
		}
		result[i] = &model.GeocachingTask{
			ID:            v.Id,
			Name:          v.Name,
			CategoryID:    category.Id,
			CategoryName:  category.Name,
			Points:        int(v.Points),
			Optional:      categoryID != category.Id,
			Status:        int(v.Status),
			Timestamp:     timestamp,
			Redone:        &redone,
			Completed:     &completed,
			Images:        v.Images,
			Introduction:  v.Introduction,
			ElectricFence: &v.ElectricFence,
		}
	}

	return result, nil
}

func (r *Resolver) getGeocachingTasks(ctx context.Context, categoryID string, in *tPB.TaskRequest, completedTask func(id string) *tPB.UserTask) ([]model.Task, error) {
	category, err := r.managementService.GetCategoryByID(ctx, &mPB.MsKeyword{Value: string(TaskCategoryGeocaching)})
	if err != nil {
		return nil, err
	}
	if category == nil {
		return []model.Task{}, nil
	}

	out, err := r.taskService.GetGeocachings(ctx, in)
	if err != nil {
		return nil, err
	}
	data := out.Data
	result := make([]model.Task, len(data))
	for i, v := range data {
		timestamp := int(time.Now().Unix())
		var redone, completed bool
		if task := completedTask(v.Id); task != nil {
			timestamp = int(task.CreateTime)
			redone = len(task.Audit) == 0 && task.Result != v.Id
			completed = task.Status == int32(TaskStatusCompleted)
		}
		result[i] = &model.GeocachingTask{
			ID:            v.Id,
			Name:          v.Name,
			CategoryID:    category.Id,
			CategoryName:  category.Name,
			Points:        int(v.Points),
			Optional:      categoryID != category.Id,
			Status:        int(v.Status),
			Timestamp:     timestamp,
			Redone:        &redone,
			Completed:     &completed,
			Images:        v.Images,
			Introduction:  v.Introduction,
			ElectricFence: &v.ElectricFence,
		}
	}

	return result, nil
}

func (r *Resolver) getScreenshots(ctx context.Context, categoryID string, sceneryspotID string, completedTask func(id string) *tPB.UserTask) ([]model.Task, error) {
	category, err := r.managementService.GetCategoryByID(ctx, &mPB.MsKeyword{Value: string(TaskCategoryScreenshot)})
	if err != nil {
		return nil, err
	}
	if category == nil {
		return []model.Task{}, nil
	}

	out, err := r.taskService.GetScreenshotBySceneryspotID(ctx, &tPB.TsKeyword{Value: sceneryspotID})
	if err != nil {
		return nil, err
	}
	data := out.Data
	result := make([]model.Task, len(data))
	for i, v := range data {
		timestamp := int(time.Now().Unix())
		var redone, completed bool
		if task := completedTask(v.Id); task != nil {
			timestamp = int(task.CreateTime)
			redone = len(task.Audit) == 0
			completed = true
		}
		result[i] = &model.ScreenshotTask{
			ID:            v.Id,
			Name:          v.Name,
			CategoryID:    category.Id,
			CategoryName:  category.Name,
			Points:        int(v.Points),
			Optional:      categoryID != category.Id,
			Status:        int(v.Status),
			Timestamp:     timestamp,
			Redone:        &redone,
			Completed:     &completed,
			Images:        v.Images,
			Introduction:  v.Introduction,
			ElectricFence: &v.ElectricFence,
		}
	}

	return result, nil
}

func (r *Resolver) getScreenshotTasks(ctx context.Context, categoryID string, in *tPB.TaskRequest, completedTask func(id string) *tPB.UserTask) ([]model.Task, error) {
	category, err := r.managementService.GetCategoryByID(ctx, &mPB.MsKeyword{Value: string(TaskCategoryScreenshot)})
	if err != nil {
		return nil, err
	}
	if category == nil {
		return []model.Task{}, nil
	}

	out, err := r.taskService.GetScreenshots(ctx, in)
	if err != nil {
		return nil, err
	}
	data := out.Data
	result := make([]model.Task, len(data))
	for i, v := range data {
		timestamp := int(time.Now().Unix())
		var redone, completed bool
		if task := completedTask(v.Id); task != nil {
			timestamp = int(task.CreateTime)
			redone = len(task.Audit) == 0
			completed = true
		}
		result[i] = &model.ScreenshotTask{
			ID:            v.Id,
			Name:          v.Name,
			CategoryID:    category.Id,
			CategoryName:  category.Name,
			Points:        int(v.Points),
			Optional:      categoryID != category.Id,
			Status:        int(v.Status),
			Timestamp:     timestamp,
			Redone:        &redone,
			Completed:     &completed,
			Images:        v.Images,
			Introduction:  v.Introduction,
			ElectricFence: &v.ElectricFence,
		}
	}

	return result, nil
}

func (r *Resolver) getPuzzles(ctx context.Context, categoryID string, sceneryspotID string, completedTask func(id string) *tPB.UserTask) ([]model.Task, error) {
	category, err := r.managementService.GetCategoryByID(ctx, &mPB.MsKeyword{Value: string(TaskCategoryPuzzle)})
	if err != nil {
		return nil, err
	}
	if category == nil {
		return []model.Task{}, nil
	}

	out, err := r.taskService.GetPuzzleBySceneryspotID(ctx, &tPB.TsKeyword{Value: sceneryspotID})
	if err != nil {
		return nil, err
	}
	data := out.Data
	result := make([]model.Task, len(data))
	for i, v := range data {
		timestamp := int(time.Now().Unix())
		var redone, completed bool
		if task := completedTask(v.Id); task != nil {
			timestamp = int(task.CreateTime)
			redone = len(task.Audit) == 0 && task.Result != v.Images
			completed = true
		}
		puzzles := strings.Split(v.Images, ",")
		result[i] = &model.PuzzleTask{
			ID:            v.Id,
			Name:          v.Name,
			CategoryID:    category.Id,
			CategoryName:  category.Name,
			Points:        int(v.Points),
			Optional:      categoryID != category.Id,
			Status:        int(v.Status),
			Timestamp:     timestamp,
			Redone:        &redone,
			Completed:     &completed,
			Level:         len(puzzles),
			Countdown:     int(v.Countdown),
			Puzzles:       puzzles,
			Introduction:  v.Introduction,
			ElectricFence: &v.ElectricFence,
		}
	}

	return result, nil
}

func (r *Resolver) getPuzzleTasks(ctx context.Context, categoryID string, in *tPB.TaskRequest, completedTask func(id string) *tPB.UserTask) ([]model.Task, error) {
	category, err := r.managementService.GetCategoryByID(ctx, &mPB.MsKeyword{Value: string(TaskCategoryPuzzle)})
	if err != nil {
		return nil, err
	}
	if category == nil {
		return []model.Task{}, nil
	}

	out, err := r.taskService.GetPuzzles(ctx, in)
	if err != nil {
		return nil, err
	}
	data := out.Data
	result := make([]model.Task, len(data))
	for i, v := range data {
		timestamp := int(time.Now().Unix())
		var redone, completed bool
		if task := completedTask(v.Id); task != nil {
			timestamp = int(task.CreateTime)
			redone = len(task.Audit) == 0 && task.Result != v.Images
			completed = task.Status == int32(TaskStatusCompleted)
		}
		puzzles := strings.Split(v.Images, ",")
		result[i] = &model.PuzzleTask{
			ID:            v.Id,
			Name:          v.Name,
			CategoryID:    category.Id,
			CategoryName:  category.Name,
			Points:        int(v.Points),
			Optional:      categoryID != category.Id,
			Status:        int(v.Status),
			Timestamp:     timestamp,
			Redone:        &redone,
			Completed:     &completed,
			Level:         len(puzzles),
			Countdown:     int(v.Countdown),
			Puzzles:       puzzles,
			Introduction:  v.Introduction,
			ElectricFence: &v.ElectricFence,
		}
	}

	return result, nil
}

func (r *Resolver) getSceneryspotIDs(ctx context.Context, eventID string) ([]string, error) {
	out, err := r.eventService.GetEventScenerySpots(ctx, &ePB.EsKeyword{Value: eventID})
	if err != nil {
		return nil, err
	}

	result := make([]string, len(out.Data))
	for i, v := range out.Data {
		if v != nil {
			result[i] = v.ScenerySpotId
		}
	}
	return result, nil
}

type userDataResolver struct{ *Resolver }

func (r *userDataResolver) Export(ctx context.Context) ([]byte, error) {
	in := &aPB.AccountRequest{Roles: []string{string(model.RoleOperator), string(model.RoleUser)}}
	out, err := r.accountService.GetAccounts(ctx, in)
	if err != nil {
		return nil, err
	}

	content := fmt.Sprintf("用户名称,微信 ID,注册时间,\n")
	for _, acc := range out.Data {
		content += fmt.Sprintf("%s,%s,%d\n", acc.WechatName, acc.Wechat, acc.CreateTime)
	}

	return []byte(content), nil
}
