package resolver

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/csv"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"math/rand"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"strings"
	"sync"
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
	mu                    sync.Mutex
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

const (
	RESOURCES_NAME   = "resources"
	UPLOADS          = "uploads"
	UPLOADS_ORIGINAL = "uploads_original"
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
func requestToken(appid, secret string) (string, error) {
	u, err := url.Parse("https://api.weixin.qq.com/cgi-bin/token")
	if err != nil {
		logger.Fatal(err)
	}
	paras := &url.Values{}
	//设置请求参数
	paras.Set("appid", appid)
	paras.Set("secret", secret)
	paras.Set("grant_type", "client_credential")
	u.RawQuery = paras.Encode()
	resp, err := http.Get(u.String())
	//关闭资源
	if resp != nil && resp.Body != nil {
		defer resp.Body.Close()
	}
	if err != nil {
		return "", errors.New("request token err :" + err.Error())
	}

	jMap := make(map[string]interface{})
	err = json.NewDecoder(resp.Body).Decode(&jMap)
	if err != nil {
		return "", errors.New("request token response json parse err :" + err.Error())
	}
	if jMap["errcode"] == nil || jMap["errcode"] == 0 {
		accessToken, _ := jMap["access_token"].(string)
		return accessToken, nil
	} else {
		//返回错误信息
		errcode := jMap["errcode"].(string)
		errmsg := jMap["errmsg"].(string)
		err = errors.New(errcode + ":" + errmsg)
		return "", err
	}
}

func GetQRCode(id string) ([]byte, error) {
	//上面生成的access code 判断为空时重新请求
	accessToken, err := requestToken("wx2b36c7777353cd2e", "8a7bca23c18dbc558ae623ba89041699")
	if err != nil {
		return nil, errors.New("get QRCode err :" + err.Error())
	}
	strUrl := fmt.Sprintf("https://api.weixin.qq.com/wxa/getwxacode?access_token=%s", accessToken)

	parm := make(map[string]string)
	parm["path"] = fmt.Sprintf("pages/coupon/check?id=%s", id)
	jsonStr, err := json.Marshal(parm)
	if err != nil {
		return nil, errors.New("json Marshal QRCode paramter err :" + err.Error())
	}
	req, err := http.NewRequest("POST", strUrl, bytes.NewBuffer([]byte(jsonStr)))
	if err != nil {
		return nil, errors.New("get QRCode err :" + err.Error())
	}

	req.Header.Set("Content-Type", "application/json")
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, errors.New("get QRCode err :" + err.Error())
	}

	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, errors.New("get QRCode err :" + err.Error())
	}

	return body, nil
}

func (r *Resolver) UpdateQRCode(v *mPB.Coupon) string {

	code, err := GetQRCode(v.Id)
	if err != nil {
		logger.Error("生成优惠券生成失败")
	}
	timestamp := time.Now().Unix()
	timestampStr := strconv.FormatInt(timestamp, 10)
	timestampStr += ".jpeg"

	name := time.Now().Format("20060102")
	tag := "QRCode"
	if len(tag) > 0 {
		name = fmt.Sprintf("%s/%s", tag, name)
	}
	if err := mkdirAll(fmt.Sprintf("%s/%s/%s", RESOURCES_NAME, UPLOADS_ORIGINAL, name)); err != nil {
		logger.Error("生成优惠券生成失败")

	}

	filename := timestampStr

	// Create file
	dst, err := os.Create(fmt.Sprintf("%s/%s/%s/%s", RESOURCES_NAME, UPLOADS_ORIGINAL, name, filename))
	defer dst.Close()
	if err != nil {
		logger.Error("生成优惠券生成失败")
	}
	_, err = dst.Write(code)
	if err != nil {
		logger.Error("生成优惠券生成失败")
	}
	// Copy the uploaded file to the created file on the filesystem
	//if _, err := io.Copy(dst, file); err != nil {
	//	logger.Error("生成优惠券生成失败")
	//}

	rawURI := fmt.Sprintf("/%s/%s/%s", UPLOADS_ORIGINAL, name, filename)
	return rawURI
}

func (r *Resolver) UpdateTideSpotConfigFromGenerateCoupon(ctx context.Context, tideSpotConfig *mPB.TideSpotConfig) {
	mu.Lock()
	generateNum := tideSpotConfig.GenerateNum + 1
	notUseNum := tideSpotConfig.NotUseNum + 1

	tideSpotConfigReq := &mPB.TideSpotConfig{
		Id:          tideSpotConfig.Id,
		GenerateNum: generateNum,
		NotUseNum:   notUseNum,
	}
	_, err := r.managementService.UpdateTideSpotConfig(ctx, tideSpotConfigReq)
	if err != nil {
		logger.Error(err)
		mu.Unlock()
	} else {
		mu.Unlock()
	}
}

func (r *Resolver) UpdateTideSpotConfigFromUseCoupon(ctx context.Context, tideSpotConfig *mPB.TideSpotConfig) {
	mu.Lock()
	useNum := tideSpotConfig.UseNum + 1
	notUseNum := tideSpotConfig.NotUseNum - 1
	useAmount := tideSpotConfig.UseAmount + tideSpotConfig.DeductionAmount

	tideSpotConfigReq := &mPB.TideSpotConfig{
		Id:        tideSpotConfig.Id,
		UseNum:    useNum,
		NotUseNum: notUseNum,
		UseAmount: useAmount,
	}
	_, err := r.managementService.UpdateTideSpotConfig(ctx, tideSpotConfigReq)
	if err != nil {
		logger.Error(err)
		mu.Unlock()
	} else {
		mu.Unlock()
	}
}

func mkdirAll(name string) error {
	if _, err := os.Stat(name); errors.Is(err, os.ErrNotExist) {
		return os.MkdirAll(name, os.ModePerm)
	}
	return nil
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
func (r *Resolver) NewCoupon(v *mPB.Coupon) *model.Coupon {
	et := int(v.EffectiveTime)
	ct := int(v.CreateTime)
	ut := int(v.UseTime)

	typeText := ""
	if v.Type == "Deduction" {
		typeText = "抵扣券"
	}
	if v.Type == "Exchange" {
		typeText = "兑换券"
	}
	state := ""
	stateText := ""
	if int(time.Now().Unix()) > et {
		state = "Expired"
		stateText = "已过期"
	} else if v.Use {
		state = "Used"
		stateText = "已使用"
	} else {
		state = "Normal"
		stateText = "待使用"
	}
	// 未使用时置空使用人员
	userWechatName := ""
	if !v.Use {
		userWechatName = ""
	}
	minimumAmount := int(v.MinimumAmount)
	deductionAmount := int(v.DeductionAmount)
	return &model.Coupon{
		ID:                     v.Id,
		Type:                   &v.Type,
		TypeText:               &typeText,
		TideSpotName:           &v.TideSpotName,
		TideSpotID:             &v.TideSpotId,
		CouponName:             &v.CouponName,
		Desc:                   &v.Desc,
		EffectiveTime:          &et,
		CreateTime:             &ct,
		QRCodePath:             &v.QrCodePath,
		State:                  &state,
		StateText:              &stateText,
		UserWechatName:         &userWechatName,
		BuyGoodName:            &v.BuyGoodName,
		VerificationWechatName: &v.VerificationWechatName,
		UserPhone:              &v.UserPhone,
		UseTime:                &ut,
		SubmitImgPath:          &v.SubmitImgPath,
		MinimumAmount:          &minimumAmount,
		DeductionAmount:        &deductionAmount,
		TideSpotConfigID:       &v.TideSpotConfigId,
		GenerateWord:           &v.GenerateWord,
		GenerateImgPath:        &v.GenerateImgPath,
		SubmitWord:             &v.SubmitWord,
	}
}

func (r *Resolver) NewTideSpotConfig(v *mPB.TideSpotConfig) *model.TideSpotConfig {
	ct := int(v.CreateTime)
	et := int(v.EffectiveTime)
	useNum := int(v.UseNum)
	generateNum := int(v.GenerateNum)
	notUseNum := int(v.NotUseNum)
	useAmount := int(v.UseAmount)
	state := ""
	stateText := ""
	generateRule := ""
	// 大于有效时间
	if int(time.Now().Unix()) > et {
		state = "Expired"
		stateText = "已过期"
	} else if !v.Enable {
		state = "Aborted"
		stateText = "已中止"
	} else {
		state = "Normal"
		stateText = "正常"
	}
	return &model.TideSpotConfig{
		ID:             v.Id,
		CreateTime:     &ct,
		TideSpotName:   &v.TideSpotName,
		CouponName:     &v.CouponName,
		Desc:           &v.Desc,
		EffectiveTime:  &et,
		UseNum:         &useNum,
		GenerateNum:    &generateNum,
		NotUseNum:      &notUseNum,
		UseAmount:      &useAmount,
		State:          &state,
		StateText:      &stateText,
		GenerateRule:   &generateRule,
		GuideDesc:      &v.GuideDesc,
		GuideVideoPath: &v.GuideVideoPath,
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
