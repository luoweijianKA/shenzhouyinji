package graph

type UnauthorizedError struct{}

type ForbiddenError struct {
	Msg string
}

type InvalidTokenError struct{}

func (e *UnauthorizedError) Error() string {
	return "unauthorized"
}

func (e *ForbiddenError) Error() string {
	if e.Msg == "" {
		return "forbidden"
	}
	return e.Msg
}

func (e *InvalidTokenError) Error() string {
	return "invalid token"
}
