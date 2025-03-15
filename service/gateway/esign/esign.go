package esign

import (
	"crypto/hmac"
	"crypto/md5"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"regexp"
	"strings"
	"time"
)

type (
	IDType   string
	CertType string

	PersonInfo struct {
		ThirdPartyUserID string `json:"thirdPartyUserId,omitempty"`
		Name             string `json:"name,omitempty"`
		IDType           IDType `json:"idType,omitempty"`
		IDNumber         string `json:"idNumber,omitempty"`
		Mobile           string `json:"mobile,omitempty"`
		Email            string `json:"email,omitempty"`
	}

	IndivInfo struct {
		Name     string
		CertType CertType
		CertNo   string
		MobileNo string
	}
)

const (
	// sml
	host      = "https://smlopenapi.esign.cn"
	appId     = "7438952961"
	appSecret = "5d482d341c04fd0fe52e31b16f95c624"

	// host      = "https://openapi.esign.cn"
	// appId     = "5111788933"
	// appSecret = "d5dbb1202c410fdc83b2c396961a6746"

	IDTypeIDCard   IDType = "CRED_PSN_CH_IDCARD"
	IDTypePassport IDType = "CRED_PSN_PASSPORT"

	CertTypeIDCard   CertType = "INDIVIDUAL_CH_IDCARD"
	CertTypePassport CertType = "INDIVIDUAL_PASSPORT"
)

func sha256Hash(val string) string {
	h := sha256.New()
	h.Write([]byte(val))
	return hex.EncodeToString(h.Sum(nil))
}

func md5Hash(val string) string {
	h := md5.New()
	h.Write([]byte(val))
	return base64.StdEncoding.EncodeToString(h.Sum(nil))
}

func sign(key []byte, msg string) []byte {
	mac := hmac.New(sha256.New, key)
	mac.Write([]byte(msg))
	return mac.Sum(nil)
}

func parsePath(url string) map[string]string {
	re := regexp.MustCompile(`^((?P<schema>.+?)://)?(?P<host>.*?)(:(?P<port>\\d+?))?(?P<path>/.*?)?(\?(?P<query>.*?))?$`)
	matches := re.FindStringSubmatch(url)

	v := make(map[string]string)

	for i, name := range re.SubexpNames() {
		if len(name) > 0 {
			v[name] = matches[i]
		}
	}

	if len(v["path"]) == 0 {
		v["path"] = "/"
	}

	return v
}

func NewESginReqeust(method string, url string, header http.Header, data string, secret string) (*http.Request, error) {
	mode := "Signature"
	timestamp := fmt.Sprintf("%v", time.Now().UnixMilli())
	contentType := "application/json; charset=UTF-8"
	accept := "*/*"

	stringToSign, contentMD5 := newSign(method, accept, contentType, url, data)
	signature := calculateSignature(stringToSign, secret)

	req, err := http.NewRequest(method, url, strings.NewReader(data))
	if err != nil {
		return nil, err
	}

	header.Add("X-Tsign-Open-App-Id", appId)
	header.Add("X-Tsign-Open-Auth-Mode", mode)
	header.Add("X-Tsign-Open-Ca-Timestamp", timestamp)
	header.Add("X-Tsign-Open-Ca-Signature", signature)
	header.Add("X-Tsign-Open-Ca-Signature-Headers", "")
	header.Add("Content-MD5", contentMD5)
	header.Add("Content-Type", contentType)
	header.Add("Accept", accept)

	req.Header = header

	return req, nil
}

func newSign(
	method string,
	accept string,
	contentType string,
	url string,
	data string,
) (string, string) {
	p := parsePath(url)
	contentMD5 := md5Hash(data)
	date := ""
	pathAndParameters := p["path"] + p["query"]
	sign := fmt.Sprintf(
		"%s\n%s\n%s\n%s\n%s\n%s",
		method,
		accept,
		contentMD5,
		contentType,
		date,
		pathAndParameters,
	)

	return sign, contentMD5
}

func calculateSignature(stringToSign string, secret string) string {
	h := hmac.New(sha256.New, []byte(secret))
	h.Write([]byte(stringToSign))
	buf := h.Sum(nil)
	return base64.StdEncoding.EncodeToString(buf)
}

func CreateByThirdPartyUserId(info PersonInfo) (string, error) {
	cl := &http.Client{}
	var data string
	if buf, err := json.Marshal(info); err == nil {
		data = string(buf)
	}
	fmt.Println("data: ", data)
	req, err := NewESginReqeust(
		"POST",
		host+"/v1/accounts/createByThirdPartyUserId",
		http.Header{},
		data,
		appSecret,
	)
	if err != nil {
		return "", err
	}

	res, err := cl.Do(req)
	if err != nil {
		return "", err
	}
	defer res.Body.Close()

	v := struct {
		Code    int    `json:"code"`
		Message string `json:"message"`
		Data    struct {
			AccountID string `json:"accountId"`
		} `json:"data"`
	}{}
	if err := json.NewDecoder(res.Body).Decode(&v); err != nil {
		return "", err
	}

	if buf, err := json.Marshal(v); err == nil {
		fmt.Println("createByThirdPartyUserId: ", string(buf))
	}

	if v.Code != 0 {
		return "", errors.New(v.Message)
	}

	return v.Data.AccountID, nil
}

func IndivIdentityUrl(accountID string, info *IndivInfo) (string, string, string, error) {
	cl := &http.Client{}
	data := `{
		"authType": "PSN_FACEAUTH_BYURL",
		"availableAuthTypes":["PSN_FACEAUTH_BYURL"],
		"indivInfo": {
			"name": "` + info.Name + `",
			"certType": "` + string(info.CertType) + `",
			"certNo": "` + info.CertNo + `",
			"mobileNo": "` + info.MobileNo + `"
		},
		"configParams": {
			"indivUneditableInfo": ["name", "certNo", "mobileNo"]
		},
		"repeatIdentity": true
	}`
	fmt.Println("data: ", data)
	req, err := NewESginReqeust(
		"POST",
		fmt.Sprintf("%s/v2/identity/auth/web/%s/indivIdentityUrl", host, accountID),
		http.Header{},
		data,
		appSecret,
	)
	if err != nil {
		return "", "", "", err
	}

	res, err := cl.Do(req)
	if err != nil {
		return "", "", "", err
	}
	defer res.Body.Close()

	v := struct {
		Code    int    `json:"code"`
		Message string `json:"message"`
		Data    struct {
			FlowID    string `json:"flowId"`
			ShortLink string `json:"shortLink"`
			URL       string `json:"url"`
		} `json:"data"`
	}{}
	if err := json.NewDecoder(res.Body).Decode(&v); err != nil {
		return "", "", "", err
	}

	if buf, err := json.Marshal(v); err == nil {
		fmt.Println("indivIdentityUrl: ", string(buf))
	}

	if v.Code != 0 {
		return "", "", "", errors.New(v.Message)
	}

	return v.Data.FlowID, v.Data.ShortLink, v.Data.URL, nil
}

func AuthDetail(flowID string) (map[string]interface{}, error) {
	cl := &http.Client{}

	req, err := NewESginReqeust(
		"GET",
		fmt.Sprintf("%s/v2/identity/auth/api/common/%s/detail", host, flowID),
		http.Header{},
		"",
		appSecret,
	)
	if err != nil {
		return nil, err
	}

	res, err := cl.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	v := struct {
		Code    int                    `json:"code"`
		Message string                 `json:"message"`
		Data    map[string]interface{} `json:"data"`
	}{}
	if err := json.NewDecoder(res.Body).Decode(&v); err != nil {
		return nil, err
	}

	if v.Code != 0 {
		return nil, errors.New(v.Message)
	}

	return v.Data, nil
}
