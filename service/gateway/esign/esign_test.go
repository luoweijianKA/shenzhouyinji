package esign

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestEsign(t *testing.T) {
	info := PersonInfo{
		ThirdPartyUserID: "2a6580e3-f66d-4459-ba8e-bcf571a80afd",
		Name:             "符玉飞",
		IDType:           IDTypeIDCard,
		IDNumber:         "440105198009184527",
		Mobile:           "13760800882",
		Email:            "",
	}

	t.Run("should be create accountId", func(t *testing.T) {
		accountID, err := CreateByThirdPartyUserId(info)
		require.Equal(t, "IP白名单不匹配", err.Error())
		require.Equal(t, "", accountID)
	})
}
