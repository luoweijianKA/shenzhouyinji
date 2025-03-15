package utils

import (
	"fmt"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestEncryptedData(t *testing.T) {
	appID := "wx2b36c7777353cd2e"
	sessionKey := "tiihtNczf5v6AKRyjwEUhQ=="
	encryptedData := "Kf89GC6Etc/e3rWwLwEuEy84Pwn5VRCPoB2CLa49lGpDBSl6uXgHI8XKrGyONTBB94xkE5KlkSLTUmhKllY19YabKODlj4co5Ub9loGsn9Qc0jh/cs2UQs1JA2+tLcfPMqark3t7ji3JweJbvwR9U956zKaAhFDFqVf8Hyjl9yZgwlMPMwGQ6IxFsNXyhS7f6X5JUMPoSqJHxNvFd4EQ3uFZVK9CVPNEQhQqcbILsI+njppNcuD1asnS5VE09AcB2+70Kk8FzthDa3RRA4PXvc2NRuqfu+3RWm44Q4XbQ0H9o1VjkUTCiPQtaEEwm/QQo6UTvPkw2hqrwajyTaVZs20KwwlwPQBWsM2+i1rOIgZ2/o7Uk5SnnmBewPeK+mA+MLjtoiNr65CTghF3opfns4aOgvo3Jx8McAjJjsBI73r4ztQXOdLsuL7UrhsjpwKvHkzh83FMAGBsqH0Tr/DomiFiNSAugd4upzUGcTcedDs+ht4NirAdIa3nxlgj+uEQm9VlRd0KafGdTd1DsNr/CzvqR1QKrD298B9fFuWxFwl+cG/Wg0+PH5Fr7/eBsz/W4pHRPwvTKg/iF4suHxPA831oPnqnw2xbDyMoOwft+uTGD0U4IF0esxGe8yHxFeTHg6VZN43XdB9DsVGKFOhbmjQbUbrWas6KJFVRS9pMtz5CNWBBV+S6GJOnLMrV0iNGAdmU8yZPnFSmKKdJjnvUBYnfanTYooyl8X7LjAuxVDQlYK+cH34CyyCJHdbJY4HuAZoWOTrWXunBnQXCfv13r3YVMa97vambtPlJSMs9UFKe2Vp6IUQzAXlbgIsT0PzwAry+X+mtztc2LcAB5mlrcCars6dw1shL6pNGw+6OWd1QHU2IFIAvfdS7q4dhQQfGqBKJ0nkasFbL2EfNlNaC5pB+K1AvYvDvx89ARS+gJMggX5JlO6Y5igTtgWGIxRi2FnUbI2eN0g1IbBFmwGAx38hBB4wuLzkXr1/bHZ7e/MN4QQangNMIdYT3hnyn/WHLTycWKg/0PrgfE9k1lNwojCj0CIhhOEW9ZvSEKzJMl1dZLC6Mb0A+k9RFwoRVUqouY9oJgGFiJ+Mu5NOllmRFVdad6oHtdIioSiKTCjg5vKQRnn44Q6DroPnU3MUOytdgmYmv8Td+BBtRbkrTodgrU/PS7ZFpgF4Fpr6aowV45+Kms3embi62GefsUpfUK8B7F0f39hEoUmzG1N8coFOeoJ+NLc1qLlWZ0ZpJgJn30N8f1Yq4SdP40dUnKh0BJFpHX+mOL6LwnCV0eMlsXRQTNxnZFJVaqKvicOen3+Kb0vSmm/5vj7wZPf8mBJngj6DJ3yqQ32l+i/Sq9mGvNCRVNPWLpMA5fnFm10ALQGqHlvHt6ToJzFnBIaRnE1w5O5vGR2kb3sHkdRohvWJvMl/8oJmsntQ+E2zS3d570krCo7akNg4PgGw1bbhqTtJo01c0M7wzvd0Jy9Rk2OgT+fRKZSAHWDOTPSYAilmFzBCPkJKjrG/JWHUgEvTDI2rYseKZ"
	iv := "w018FghDFBEN+8nMPrQltQ=="

	t.Run("should be ok", func(t *testing.T) {
		v, err := WXBizDataCryptDecode(appID, sessionKey, encryptedData, iv)
		require.Nil(t, err)
		fmt.Println(v)
		require.Equal(t, "Guangzhou", v["city"])
		require.Equal(t, "Guangdong", v["province"])
		require.Equal(t, "CN", v["country"])
		require.Equal(t, "zh_CN", v["language"])
	})
}
