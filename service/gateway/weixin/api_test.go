package weixin

import (
	"strings"
	"testing"
	"time"

	"github.com/stretchr/testify/require"
)

func TestAPI(t *testing.T) {
	api := NewAPI("wx2b36c7777353cd2e", "8a7bca23c18dbc558ae623ba89041699")

	t.Run("should be invalid code", func(t *testing.T) {
		_, err := api.PhoneNumber("a81e6a0f89e6bbdf73d96f3a08ac48174abe743b13033983b6ca57bd04aeb29a")
		require.Equal(t, true, strings.HasPrefix(err.Error(), "invalid code"))
	})

	t.Run("should be refreshed token", func(t *testing.T) {
		api.TokenDuration = 5
		time.Sleep(5 * time.Second)
		accessToken := api.accessToken
		time.Sleep(5 * time.Second)
		require.NotEqual(t, accessToken, api.accessToken)
	})
}
