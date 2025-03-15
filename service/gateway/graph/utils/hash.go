package utils

import (
	"crypto/sha1"
	"encoding/hex"

	"golang.org/x/crypto/bcrypt"
)

func HashPassword(password string) (string, error) {
	pass, err := bcrypt.GenerateFromPassword([]byte(password), 10)
	return string(pass), err
}

func ComparePassword(password string, hash string) bool {
	byteHash := []byte(hash)
	bytePassword := []byte(password)
	err := bcrypt.CompareHashAndPassword(byteHash, bytePassword)

	return err == nil
}

func Sha1(val string) string {
	h := sha1.New()
	h.Write([]byte(val))
	return hex.EncodeToString(h.Sum(nil))
}
