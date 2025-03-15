package model

import (
	ePB "gitlab.com/annoying-orange/shenzhouyinji/service/event/proto"
)

type Token struct {
	Key           string         `bson:"key"`
	Value         string         `bson:"value"`
	ExpiresIn     int64          `bson:"expiresIn"`
	WechetSession *WechetSession `bson:"wechetSession"`
}

type WechetSession struct {
	SessionKey string `bson:"session_key" json:"session_key"`
	Openid     string `bson:"openid" json:"openid"`
	Unionid    string `bson:"unionid" json:"unionid"`
	ErrMsg     string `bson:"errmsg" json:"errmsg"`
	ErrCode    int    `bson:"errcode" json:"errcode"`
	RID        string `bson:"rid" json:"rid"`
}

type Account struct {
	ID           string   `json:"id"`
	LoginID      string   `json:"loginId"`
	Wechat       *string  `json:"wechat"`
	WechatName   *string  `json:"wechat_name"`
	WechatAvatar *string  `json:"wechat_avatar"`
	Role         Role     `json:"role"`
	Scopes       []string `json:"scopes"`
	Status       int      `json:"status"`
	CreateTime   int      `json:"create_time"`
}

type Passport struct {
	ID            string `json:"id"`
	PassportSetID string `json:"passport_set_id"`
	EventID       string `json:"event_id"`
	Code          string `json:"code"`
	Status        int    `json:"status"`
}

type UserPassport struct {
	ID             string  `json:"id"`
	UserID         string  `json:"user_id"`
	EventID        string  `json:"event_id"`
	CampID         *string `json:"camp_id"`
	PassportCode   *string `json:"passport_code"`
	RealName       *string `json:"real_name"`
	Nric           *string `json:"nric"`
	Phone          *string `json:"phone"`
	Gender         *string `json:"gender"`
	Profession     *string `json:"profession"`
	Authentication *bool   `json:"authentication"`
	GuardianName   *string `json:"guardian_name"`
	GuardianNric   *string `json:"guardian_nric"`
	GuardianPhone  *string `json:"guardian_phone"`
	ClaimCode      *string `json:"claim_code"`
	ClaimBy        *string `json:"claim_by"`
	ClaimTime      int     `json:"claim_time"`
	Status         int     `json:"status"`
	CreateTime     int     `json:"create_time"`
}

type UserTask struct {
	ID            string  `json:"id"`
	UserID        string  `json:"user_id"`
	EventID       string  `json:"event_id"`
	CampID        string  `json:"camp_id"`
	SceneryspotID string  `json:"sceneryspot_id"`
	TaskID        string  `json:"task_id"`
	TaskCategory  string  `json:"task_category"`
	Result        string  `json:"result"`
	Points        int     `json:"points"`
	Status        int     `json:"status"`
	Audit         *string `json:"audit"`
	CreateTime    int     `json:"create_time"`
}

type EventPassport struct {
	ID            string  `json:"id"`
	Code          string  `json:"code"`
	UserID        *string `json:"userId"`
	UserCampID    *string `json:"userCampId"`
	EventID       string  `json:"eventId"`
	Name          string  `json:"name"`
	Nric          string  `json:"nric"`
	Phone         string  `json:"phone"`
	Gender        *string `json:"gender"`
	Profession    *string `json:"profession"`
	ClaimCode     *string `json:"claimCode"`
	ClaimBy       *string `json:"claimBy"`
	ClaimTime     int     `json:"claimTime"`
	GuardianName  *string `json:"guardianName"`
	GuardianNric  *string `json:"guardianNric"`
	GuardianPhone *string `json:"guardianPhone"`
	Status        int     `json:"status"`
}

type EventTask struct {
	ID         string  `json:"id"`
	UserID     string  `json:"user_id"`
	UserName   string  `json:"user_name"`
	UserWechat string  `json:"user_wechat"`
	CampID     string  `json:"camp_id"`
	CampName   string  `json:"camp_name"`
	TaskID     string  `json:"task_id"`
	CategoryID string  `json:"category_id"`
	Points     int     `json:"points"`
	Result     string  `json:"result"`
	Status     int     `json:"status"`
	Audit      *string `json:"audit"`
	CreateTime int     `json:"create_time"`
}

func NewEventTask(v *ePB.EventTask) *EventTask {
	return &EventTask{
		ID:         v.Id,
		UserID:     v.UserId,
		UserName:   v.UserName,
		UserWechat: v.UserWechat,
		CampID:     v.CampId,
		CampName:   v.CampName,
		TaskID:     v.TaskId,
		CategoryID: v.TaskCategory,
		Points:     int(v.Points),
		Result:     v.Result,
		Status:     int(v.Status),
		Audit:      &v.Audit,
		CreateTime: int(v.CreateTime),
	}
}

type UserSwap struct {
	ID          string                   `json:"id"`
	UserID      string                   `json:"userId"`
	UserName    string                   `json:"userName"`
	UserAvatar  string                   `json:"userAvatar"`
	Badges      []*Badge                 `json:"badges,omitempty"`
	City        *string                  `json:"city,omitempty"`
	Content     []map[string]interface{} `json:"content,omitempty"`
	Status      int                      `json:"status"`
	CreateTime  int                      `json:"createTime"`
	ExpiredTime int                      `json:"expiredTime"`
}
