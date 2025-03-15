package utils

import (
	"crypto/aes"
	"crypto/cipher"
	"encoding/base64"
	"encoding/json"
	"errors"
)

func WXBizDataCryptDecode(appID, sessionKey, data, iv string) (map[string]interface{}, error) {
	key, _ := base64.StdEncoding.DecodeString(sessionKey)
	ciphertext, _ := base64.StdEncoding.DecodeString(data)
	decodedIV, _ := base64.StdEncoding.DecodeString(iv)

	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}

	blockMode := cipher.NewCBCDecrypter(block, decodedIV)
	plaintext := make([]byte, len(ciphertext))

	blockMode.CryptBlocks(plaintext, ciphertext)

	length := len(plaintext)
	unpadding := int(plaintext[length-1])
	plaintext = plaintext[:(length - unpadding)]

	v := make(map[string]interface{})
	if err := json.Unmarshal(plaintext, &v); err != nil {
		return nil, err
	}

	if wm, ok := v["watermark"]; ok {
		if wmAppID, ok := wm.(map[string]interface{})["appid"]; !ok || wmAppID != appID {
			return nil, errors.New("Invalid Buffer")
		}

		// remove watermark
		delete(v, "watermark")
		return v, nil
	}

	return map[string]interface{}{}, nil
}
