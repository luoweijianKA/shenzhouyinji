package auth

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"time"

	"gateway/graph/model"

	"github.com/dgrijalva/jwt-go"
	pb "gitlab.com/annoying-orange/shenzhouyinji/service/account/proto"
)

const (
	algorithm = "HMAC-SHA256"
	secretKey = "LNn6e6TBmfZUQKFJ"
)

func Sha256Hash(val string) string {
	h := sha256.New()
	h.Write([]byte(val))
	return hex.EncodeToString(h.Sum(nil))
}

func sign(key []byte, msg string) []byte {
	mac := hmac.New(sha256.New, key)
	mac.Write([]byte(msg))
	return mac.Sum(nil)
}

func CalculateSignature(stringToSign string, timestamp string) string {
	buf := sign([]byte("AU"+secretKey), timestamp)
	mac := hmac.New(sha256.New, buf)
	mac.Write([]byte(stringToSign))
	return hex.EncodeToString(mac.Sum(nil))
}

func NewSign(input string, timestamp string) string {
	s := sign([]byte(input), fmt.Sprintf("%s\n%s\n%s", algorithm, input, timestamp))

	return string(s)
}

// GenerateToken generates a jwt token and assign a username to it's claims and return it
func GenerateToken(acc *pb.Account) (*model.Token, error) {

	expiresIn := time.Now().Add(time.Hour * 72).Unix()
	t := jwt.New(jwt.SigningMethodHS256)

	/* Create a map to store our claims */
	claims := t.Claims.(jwt.MapClaims)

	/* Set token claims */
	claims["id"] = acc.Id
	claims["loginId"] = acc.LoginId
	claims["role"] = acc.Role
	claims["timestamp"] = time.Now().Unix()
	claims["exp"] = expiresIn

	value, err := t.SignedString([]byte(secretKey))
	if err != nil {
		return nil, err
	}

	token := &model.Token{
		Key:       Sha256Hash(value),
		Value:     value,
		ExpiresIn: expiresIn,
	}

	return token, nil
}

func ParseToken(tokenString string) (*pb.Account, error) {
	token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
		return []byte(secretKey), nil
	})
	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {

		acc := &pb.Account{
			Id:      claims["id"].(string),
			LoginId: claims["loginId"].(string),
			Role:    claims["role"].(string),
		}

		return acc, nil
	}

	return nil, fmt.Errorf("invalid token")
}
