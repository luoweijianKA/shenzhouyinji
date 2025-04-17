package auth

import (
	"context"
	"net/http"
	"strings"
	"sync"

	"gateway/graph/model"

	pb "gitlab.com/annoying-orange/shenzhouyinji/service/account/proto"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type contextKey struct {
	name string
}

type UserContext struct {
	Token         string
	User          *pb.Account
	UserAgent     string
	RemoteAddr    string
	WechetSession *model.WechetSession
}

var (
	userCtxKey = &contextKey{"user"}
	// remoteAddrCtxKey = &contextKey{"remoteAddr"}
	Mu sync.Mutex
)

func Middleware(db *mongo.Database) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			var token string
			var user *pb.Account
			var wechetSession *model.WechetSession

			authorization := r.Header.Get("Authorization")
			userAgent := r.Header.Get("User-Agent")
			remoteAddr := headerRemoteAddr(r)

			if len(authorization) > 0 {
				token = authorization[len("Bearer "):]
				v := model.Token{}

				filter := bson.D{{Key: "key", Value: token}}
				err := db.Collection("session").FindOne(r.Context(), filter).Decode(&v)

				if err != nil {
					http.Error(w, "unauthorized", http.StatusUnauthorized)
					return
				}

				// if b, err := json.MarshalIndent(session.Token, "", "  "); err == nil {
				// 	fmt.Println(string(b))
				// }

				u, err := ParseToken(v.Value)
				if err != nil {
					http.Error(w, "unauthorized", http.StatusUnauthorized)
					return
				}

				user = u
				wechetSession = v.WechetSession
			}

			userCtx := &UserContext{
				Token:         token,
				User:          user,
				UserAgent:     userAgent,
				RemoteAddr:    remoteAddr,
				WechetSession: wechetSession,
			}

			// put it in context
			ctx := context.WithValue(r.Context(), userCtxKey, userCtx)

			// and call the next with our new context
			r = r.WithContext(ctx)
			next.ServeHTTP(w, r)
		})
	}
}

// ForContext finds the user from the context. REQUIRES Middleware to have run
func ForContext(ctx context.Context) *UserContext {
	val, _ := ctx.Value(userCtxKey).(*UserContext)
	return val
}

func headerRemoteAddr(r *http.Request) string {
	var addr string

	keys := []string{"x-forwarded-for", "Proxy-Client-IP", "WL-Proxy-Client-IP", "HTTP_CLIENT_IP", "HTTP_X_FORWARDED_FOR"}
	for _, key := range keys {
		addr = r.Header.Get(key)
		if len(addr) > 0 && addr != "unknown" {
			break
		}
	}

	if len(addr) == 0 || addr == "unknown" {
		addr = r.RemoteAddr
	}

	return strings.Split(addr, ",")[0]
}
