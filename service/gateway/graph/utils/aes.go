package utils

import (
	"bytes"
	"crypto/aes"
	"crypto/cipher"
	"encoding/base64"
)

var (
	aeskey = []byte("hgsakfgq87430915")
)

func AESEncrypt(v string) (string, error) {
	block, err := aes.NewCipher(aeskey)
	if err != nil {
		return "", err
	}

	plaintext := []byte(v)
	blockSize := block.BlockSize()
	padding := blockSize - len(plaintext)%blockSize
	plaintext = append(plaintext, bytes.Repeat([]byte{byte(padding)}, padding)...)

	blockMode := cipher.NewCBCEncrypter(block, aeskey[:blockSize])
	ciphertext := make([]byte, len(plaintext))

	blockMode.CryptBlocks(ciphertext, plaintext)

	return base64.StdEncoding.EncodeToString(ciphertext), err
}

func AESDecrypt(v string) (string, error) {
	block, err := aes.NewCipher(aeskey)
	if err != nil {
		return "", err
	}

	ciphertext, _ := base64.StdEncoding.DecodeString(v)
	blockSize := block.BlockSize()
	blockMode := cipher.NewCBCDecrypter(block, aeskey[:blockSize])
	plaintext := make([]byte, len(ciphertext))

	blockMode.CryptBlocks(plaintext, ciphertext)

	length := len(plaintext)
	unpadding := int(plaintext[length-1])
	plaintext = plaintext[:(length - unpadding)]

	return string(plaintext), nil
}
