package ocr

import (
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"go-micro.dev/v4/logger"
	"io/ioutil"
	"net/http"
	"net/url"
	"os"
	"strings"
)

const (
	RESOURCES_NAME   = "resources"
	BAIDU_API_KEY    = "ZsfTffyYkA6Er61p5BGvbYrF"
	BAIDU_SECRET_KEY = "oIs5KC7RcmYdRrymSElXLqF1cKCDKpzs"
)

type WxOcrRes struct {
	Items []WxOcrItem `json:"items"`
}

type WxOcrItem struct {
	Text string `json:"text"`
}

type BaiDuOcrRes struct {
	Items []BaiDuOcrItem `json:"result"`
}

type BaiDuOcrItem struct {
	Probability float32 `json:"probability"`
}

var (
	WX_APP_ID     = os.Getenv("WECHAT_APPID")
	WX_APP_SECRET = os.Getenv("WECHAT_SECRET")
	WX_OCR_URL    = "https://api.weixin.qq.com/cv/ocr/comm?access_token=%s&img_url=%s"
)

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

func OcrLogo(path string) (bool, error) {
	postUrl := "https://aip.baidubce.com/rest/2.0/image-classify/v2/logo?access_token=" + GetAccessToken()

	// image 可以通过 GetFileContentAsBase64("C:\fakepath\tou2.jpg") 方法获取，如需转码请使用 url.QueryEscape()
	param := "true"
	imgStr := GetFileContentAsBase64(RESOURCES_NAME + path)
	var builder strings.Builder
	builder.WriteString(url.QueryEscape("image"))
	builder.WriteString("=")
	builder.WriteString(url.QueryEscape(imgStr))
	builder.WriteString("&")
	builder.WriteString(url.QueryEscape("custom_lib"))
	builder.WriteString("=")
	builder.WriteString(url.QueryEscape(param))
	payload := strings.NewReader(builder.String())

	client := &http.Client{}
	req, err := http.NewRequest("POST", postUrl, payload)

	if err != nil {
		fmt.Println(err)
		return false, nil
	}
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Add("Accept", "application/json")

	res, err := client.Do(req)
	if err != nil {
		fmt.Println(err)
		return false, nil
	}
	defer res.Body.Close()

	body, err := ioutil.ReadAll(res.Body)
	if err != nil {
		fmt.Println(err)
		return false, nil
	}
	baiDuOcrRes := new(BaiDuOcrRes)
	err = json.Unmarshal(body, &baiDuOcrRes)
	if err != nil {
		fmt.Println("Error reading response body:", err)
		return false, err
	}
	ocrLogoRes := false
	for _, item := range baiDuOcrRes.Items {
		ocrLogoRes = item.Probability > 0.5
		if ocrLogoRes {
			break
		}
	}

	fmt.Println(string(body))
	return ocrLogoRes, nil
}

func OcrText(path string) (string, error) {

	imgUrl := fmt.Sprintf(os.Getenv("STATIC_URL_PREFIX") + path)

	// 发送POST请求到微信OCR API
	token, err := requestToken(WX_APP_ID, WX_APP_SECRET)
	if err != nil {
		return "", err
	}
	url := fmt.Sprintf(WX_OCR_URL, token, imgUrl)
	resp, err := http.Post(url, "application/json", strings.NewReader(fmt.Sprintf(`{"data_type":"2", "ocr_type":"8"}`)))

	if err != nil {
		fmt.Println("Error posting data:", err)
		return "", err
	}
	defer resp.Body.Close()

	// 读取响应内容
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		fmt.Println("Error reading response body:", err)
		return "", err
	}

	// 打印响应结果
	fmt.Println(string(body))

	orcTextRes := new(WxOcrRes)
	err = json.Unmarshal(body, &orcTextRes)
	if err != nil {
		fmt.Println("Error reading response body:", err)
		return "", err
	}
	textRes := make([]byte, 0, 1000)
	for i := range orcTextRes.Items {
		textRes = append(textRes, []byte(orcTextRes.Items[i].Text)...)
	}

	return string(textRes), nil
}

func UploadLogo(path, configId string) {

	postUrl := "https://aip.baidubce.com/rest/2.0/realtime_search/v1/logo/add?access_token=" + GetAccessToken()
	briefStr := fmt.Sprintf("{\"logoDbId\":\"%s\"}", configId)
	imgStr := GetFileContentAsBase64(RESOURCES_NAME + path)
	var builder strings.Builder
	builder.WriteString(url.QueryEscape("image"))
	builder.WriteString("=")
	builder.WriteString(url.QueryEscape(imgStr))
	builder.WriteString("&")
	builder.WriteString(url.QueryEscape("brief"))
	builder.WriteString("=")
	builder.WriteString(url.QueryEscape(briefStr))
	payload := strings.NewReader(builder.String())

	client := &http.Client{}
	req, err := http.NewRequest("POST", postUrl, payload)

	if err != nil {
		fmt.Println(err)
		return
	}
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Add("Accept", "application/json")

	res, err := client.Do(req)
	if err != nil {
		fmt.Println(err)
		return
	}
	defer res.Body.Close()

	body, err := ioutil.ReadAll(res.Body)
	if err != nil {
		fmt.Println(err)
		return
	}
	fmt.Println(string(body))
}

/**
 * 获取文件base64编码
 * @param string  path 文件路径
 * @return string base64编码信息，不带文件头
 */
func GetFileContentAsBase64(path string) string {
	srcByte, err := ioutil.ReadFile(path)
	if err != nil {
		fmt.Println(err)
		return ""
	}
	return base64.StdEncoding.EncodeToString(srcByte)
}

/**
 * 使用 AK，SK 生成鉴权签名（Access Token）
 * @return string 鉴权签名信息（Access Token）
 */
func GetAccessToken() string {
	url := "https://aip.baidubce.com/oauth/2.0/token"
	postData := fmt.Sprintf("grant_type=client_credentials&client_id=%s&client_secret=%s", BAIDU_API_KEY, BAIDU_SECRET_KEY)
	resp, err := http.Post(url, "application/x-www-form-urlencoded", strings.NewReader(postData))
	if err != nil {
		fmt.Println(err)
		return ""
	}
	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		fmt.Println(err)
		return ""
	}
	accessTokenObj := map[string]any{}
	_ = json.Unmarshal([]byte(body), &accessTokenObj)
	return accessTokenObj["access_token"].(string)
}
