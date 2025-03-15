package weixin

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"go-micro.dev/v4/logger"
)

type PhoneInfo struct {
	PhoneNumber string `json:"phoneNumber"`
	CountryCode string `json:"countryCode"`
}

type API struct {
	appid       string
	secret      string
	accessToken string
	expiresIn   int64

	TokenDuration int64
}

func NewAPI(appid string, secret string) *API {
	wx := &API{appid: appid, secret: secret, TokenDuration: 3600}

	if len(wx.appid) != 0 && len(wx.secret) != 0 {
		go func(wx *API) {
			wx.refreshToken()
			start := time.Now().Unix()
			for tick := range time.Tick(5 * time.Second) {
				now := tick.Unix()
				// fmt.Println(start, wx.TokenDuration, wx.expiresIn, now)
				if start+wx.TokenDuration <= now || wx.expiresIn-now < 5*60 {
					wx.refreshToken()
					start = now
				}
			}
		}(wx)
	}

	return wx
}

func (wx *API) refreshToken() error {
	url := fmt.Sprintf(
		"https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=%s&secret=%s",
		wx.appid,
		wx.secret,
	)
	res, err := http.Get(url)
	if err != nil {
		return err
	}
	defer res.Body.Close()

	v := struct {
		AccessToken string `json:"access_token"`
		ExpiresIn   int64  `json:"expires_in"`
	}{}
	if err := json.NewDecoder(res.Body).Decode(&v); err != nil {
		return err
	}

	wx.accessToken = v.AccessToken
	wx.expiresIn = time.Now().Add(time.Duration(v.ExpiresIn) * time.Second).Unix()
	// logger.Infof("get new access token %s, and expires in %d.", wx.accessToken, wx.expiresIn)

	return nil
}

func (wx *API) PhoneNumber(code string) (*PhoneInfo, error) {
	if len(wx.accessToken) == 0 {
		if err := wx.refreshToken(); err != nil {
			logger.Error(err)
			return nil, err
		}
	}

	url := fmt.Sprintf(
		"https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=%s",
		wx.accessToken,
	)
	res, err := http.Post(url, "application/json", strings.NewReader(fmt.Sprintf(`{"code": "%s"}`, code)))
	if err != nil {
		logger.Error(err)
		return nil, err
	}
	defer res.Body.Close()

	v := struct {
		ErrCode   int       `json:"errcode"`
		ErrMsg    string    `json:"errmsg"`
		PhoneInfo PhoneInfo `json:"phone_info"`
	}{}
	if err := json.NewDecoder(res.Body).Decode(&v); err != nil {
		logger.Error(err)
		return nil, err
	}

	if v.ErrCode != 0 {
		return nil, errors.New(v.ErrMsg)
	}

	return &v.PhoneInfo, nil
}
