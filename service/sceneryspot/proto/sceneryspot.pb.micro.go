// Code generated by protoc-gen-micro. DO NOT EDIT.
// source: proto/sceneryspot.proto

package shenzhouyinji

import (
	fmt "fmt"
	proto "google.golang.org/protobuf/proto"
	math "math"
)

import (
	context "context"
	api "go-micro.dev/v4/api"
	client "go-micro.dev/v4/client"
	server "go-micro.dev/v4/server"
)

// Reference imports to suppress errors if they are not otherwise used.
var _ = proto.Marshal
var _ = fmt.Errorf
var _ = math.Inf

// Reference imports to suppress errors if they are not otherwise used.
var _ api.Endpoint
var _ context.Context
var _ client.Option
var _ server.Option

// Api Endpoints for SceneryspotService service

func NewSceneryspotServiceEndpoints() []*api.Endpoint {
	return []*api.Endpoint{}
}

// Client API for SceneryspotService service

type SceneryspotService interface {
	CreateStamp(ctx context.Context, in *Stamp, opts ...client.CallOption) (*SsKeyword, error)
	UpdateStamp(ctx context.Context, in *Stamp, opts ...client.CallOption) (*SsUpdateRes, error)
	GetStamp(ctx context.Context, in *SsKeyword, opts ...client.CallOption) (*Stamp, error)
	GetStampsBySceneryspotID(ctx context.Context, in *SsKeyword, opts ...client.CallOption) (*StampsRes, error)
	CreateUserStamp(ctx context.Context, in *UserStamp, opts ...client.CallOption) (*UserStampsRes, error)
	UpdateUserStamp(ctx context.Context, in *UserStamp, opts ...client.CallOption) (*UserStampsRes, error)
	GetUserStampByUserID(ctx context.Context, in *SsKeyword, opts ...client.CallOption) (*UserStampsRes, error)
	GetUserStampByStampID(ctx context.Context, in *SsKeyword, opts ...client.CallOption) (*UserStampsRes, error)
	CreateServiceItem(ctx context.Context, in *ServiceItem, opts ...client.CallOption) (*SsKeyword, error)
	UpdateServiceItem(ctx context.Context, in *ServiceItem, opts ...client.CallOption) (*SsUpdateRes, error)
	GetServiceItem(ctx context.Context, in *SsKeyword, opts ...client.CallOption) (*ServiceItem, error)
	GetServiceItemsBySceneryspotID(ctx context.Context, in *SsKeyword, opts ...client.CallOption) (*ServiceItemsRes, error)
	GetServiceItemsByCategory(ctx context.Context, in *SsKeywordByCategory, opts ...client.CallOption) (*ServiceItemsRes, error)
	CreateSceneryspot(ctx context.Context, in *Sceneryspot, opts ...client.CallOption) (*SsKeyword, error)
	UpdateSceneryspot(ctx context.Context, in *Sceneryspot, opts ...client.CallOption) (*SsUpdateRes, error)
	GetSceneryspot(ctx context.Context, in *SsKeyword, opts ...client.CallOption) (*Sceneryspot, error)
	GetSceneryspots(ctx context.Context, in *SsEmptyReq, opts ...client.CallOption) (*SceneryspotsRes, error)
	GetSceneryspotsByIDs(ctx context.Context, in *SsKeywords, opts ...client.CallOption) (*SceneryspotsRes, error)
	CreateUserSceneryspot(ctx context.Context, in *UserSceneryspot, opts ...client.CallOption) (*UserSceneryspotResponse, error)
	GetUserSceneryspots(ctx context.Context, in *UserSceneryspotRequest, opts ...client.CallOption) (*UserSceneryspotResponse, error)
	GetUserStamp(ctx context.Context, in *UserStampRequest, opts ...client.CallOption) (*UserStampsRes, error)
	UpdateUserStampRecord(ctx context.Context, in *UserStampRecordReq, opts ...client.CallOption) (*SsUpdateRes, error)
	GetUserStampPointsRecord(ctx context.Context, in *UserStampPointsRecordReq, opts ...client.CallOption) (*UserStampPointsRecordRes, error)
}

type sceneryspotService struct {
	c    client.Client
	name string
}

func NewSceneryspotService(name string, c client.Client) SceneryspotService {
	return &sceneryspotService{
		c:    c,
		name: name,
	}
}

func (c *sceneryspotService) CreateStamp(ctx context.Context, in *Stamp, opts ...client.CallOption) (*SsKeyword, error) {
	req := c.c.NewRequest(c.name, "SceneryspotService.CreateStamp", in)
	out := new(SsKeyword)
	err := c.c.Call(ctx, req, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *sceneryspotService) UpdateStamp(ctx context.Context, in *Stamp, opts ...client.CallOption) (*SsUpdateRes, error) {
	req := c.c.NewRequest(c.name, "SceneryspotService.UpdateStamp", in)
	out := new(SsUpdateRes)
	err := c.c.Call(ctx, req, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *sceneryspotService) GetStamp(ctx context.Context, in *SsKeyword, opts ...client.CallOption) (*Stamp, error) {
	req := c.c.NewRequest(c.name, "SceneryspotService.GetStamp", in)
	out := new(Stamp)
	err := c.c.Call(ctx, req, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *sceneryspotService) GetStampsBySceneryspotID(ctx context.Context, in *SsKeyword, opts ...client.CallOption) (*StampsRes, error) {
	req := c.c.NewRequest(c.name, "SceneryspotService.GetStampsBySceneryspotID", in)
	out := new(StampsRes)
	err := c.c.Call(ctx, req, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *sceneryspotService) CreateUserStamp(ctx context.Context, in *UserStamp, opts ...client.CallOption) (*UserStampsRes, error) {
	req := c.c.NewRequest(c.name, "SceneryspotService.CreateUserStamp", in)
	out := new(UserStampsRes)
	err := c.c.Call(ctx, req, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *sceneryspotService) UpdateUserStamp(ctx context.Context, in *UserStamp, opts ...client.CallOption) (*UserStampsRes, error) {
	req := c.c.NewRequest(c.name, "SceneryspotService.UpdateUserStamp", in)
	out := new(UserStampsRes)
	err := c.c.Call(ctx, req, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *sceneryspotService) GetUserStampByUserID(ctx context.Context, in *SsKeyword, opts ...client.CallOption) (*UserStampsRes, error) {
	req := c.c.NewRequest(c.name, "SceneryspotService.GetUserStampByUserID", in)
	out := new(UserStampsRes)
	err := c.c.Call(ctx, req, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *sceneryspotService) GetUserStampByStampID(ctx context.Context, in *SsKeyword, opts ...client.CallOption) (*UserStampsRes, error) {
	req := c.c.NewRequest(c.name, "SceneryspotService.GetUserStampByStampID", in)
	out := new(UserStampsRes)
	err := c.c.Call(ctx, req, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *sceneryspotService) CreateServiceItem(ctx context.Context, in *ServiceItem, opts ...client.CallOption) (*SsKeyword, error) {
	req := c.c.NewRequest(c.name, "SceneryspotService.CreateServiceItem", in)
	out := new(SsKeyword)
	err := c.c.Call(ctx, req, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *sceneryspotService) UpdateServiceItem(ctx context.Context, in *ServiceItem, opts ...client.CallOption) (*SsUpdateRes, error) {
	req := c.c.NewRequest(c.name, "SceneryspotService.UpdateServiceItem", in)
	out := new(SsUpdateRes)
	err := c.c.Call(ctx, req, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *sceneryspotService) GetServiceItem(ctx context.Context, in *SsKeyword, opts ...client.CallOption) (*ServiceItem, error) {
	req := c.c.NewRequest(c.name, "SceneryspotService.GetServiceItem", in)
	out := new(ServiceItem)
	err := c.c.Call(ctx, req, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *sceneryspotService) GetServiceItemsBySceneryspotID(ctx context.Context, in *SsKeyword, opts ...client.CallOption) (*ServiceItemsRes, error) {
	req := c.c.NewRequest(c.name, "SceneryspotService.GetServiceItemsBySceneryspotID", in)
	out := new(ServiceItemsRes)
	err := c.c.Call(ctx, req, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *sceneryspotService) GetServiceItemsByCategory(ctx context.Context, in *SsKeywordByCategory, opts ...client.CallOption) (*ServiceItemsRes, error) {
	req := c.c.NewRequest(c.name, "SceneryspotService.GetServiceItemsByCategory", in)
	out := new(ServiceItemsRes)
	err := c.c.Call(ctx, req, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *sceneryspotService) CreateSceneryspot(ctx context.Context, in *Sceneryspot, opts ...client.CallOption) (*SsKeyword, error) {
	req := c.c.NewRequest(c.name, "SceneryspotService.CreateSceneryspot", in)
	out := new(SsKeyword)
	err := c.c.Call(ctx, req, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *sceneryspotService) UpdateSceneryspot(ctx context.Context, in *Sceneryspot, opts ...client.CallOption) (*SsUpdateRes, error) {
	req := c.c.NewRequest(c.name, "SceneryspotService.UpdateSceneryspot", in)
	out := new(SsUpdateRes)
	err := c.c.Call(ctx, req, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *sceneryspotService) GetSceneryspot(ctx context.Context, in *SsKeyword, opts ...client.CallOption) (*Sceneryspot, error) {
	req := c.c.NewRequest(c.name, "SceneryspotService.GetSceneryspot", in)
	out := new(Sceneryspot)
	err := c.c.Call(ctx, req, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *sceneryspotService) GetSceneryspots(ctx context.Context, in *SsEmptyReq, opts ...client.CallOption) (*SceneryspotsRes, error) {
	req := c.c.NewRequest(c.name, "SceneryspotService.GetSceneryspots", in)
	out := new(SceneryspotsRes)
	err := c.c.Call(ctx, req, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *sceneryspotService) GetSceneryspotsByIDs(ctx context.Context, in *SsKeywords, opts ...client.CallOption) (*SceneryspotsRes, error) {
	req := c.c.NewRequest(c.name, "SceneryspotService.GetSceneryspotsByIDs", in)
	out := new(SceneryspotsRes)
	err := c.c.Call(ctx, req, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *sceneryspotService) CreateUserSceneryspot(ctx context.Context, in *UserSceneryspot, opts ...client.CallOption) (*UserSceneryspotResponse, error) {
	req := c.c.NewRequest(c.name, "SceneryspotService.CreateUserSceneryspot", in)
	out := new(UserSceneryspotResponse)
	err := c.c.Call(ctx, req, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *sceneryspotService) GetUserSceneryspots(ctx context.Context, in *UserSceneryspotRequest, opts ...client.CallOption) (*UserSceneryspotResponse, error) {
	req := c.c.NewRequest(c.name, "SceneryspotService.GetUserSceneryspots", in)
	out := new(UserSceneryspotResponse)
	err := c.c.Call(ctx, req, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *sceneryspotService) GetUserStamp(ctx context.Context, in *UserStampRequest, opts ...client.CallOption) (*UserStampsRes, error) {
	req := c.c.NewRequest(c.name, "SceneryspotService.GetUserStamp", in)
	out := new(UserStampsRes)
	err := c.c.Call(ctx, req, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *sceneryspotService) UpdateUserStampRecord(ctx context.Context, in *UserStampRecordReq, opts ...client.CallOption) (*SsUpdateRes, error) {
	req := c.c.NewRequest(c.name, "SceneryspotService.UpdateUserStampRecord", in)
	out := new(SsUpdateRes)
	err := c.c.Call(ctx, req, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *sceneryspotService) GetUserStampPointsRecord(ctx context.Context, in *UserStampPointsRecordReq, opts ...client.CallOption) (*UserStampPointsRecordRes, error) {
	req := c.c.NewRequest(c.name, "SceneryspotService.GetUserStampPointsRecord", in)
	out := new(UserStampPointsRecordRes)
	err := c.c.Call(ctx, req, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

// Server API for SceneryspotService service

type SceneryspotServiceHandler interface {
	CreateStamp(context.Context, *Stamp, *SsKeyword) error
	UpdateStamp(context.Context, *Stamp, *SsUpdateRes) error
	GetStamp(context.Context, *SsKeyword, *Stamp) error
	GetStampsBySceneryspotID(context.Context, *SsKeyword, *StampsRes) error
	CreateUserStamp(context.Context, *UserStamp, *UserStampsRes) error
	UpdateUserStamp(context.Context, *UserStamp, *UserStampsRes) error
	GetUserStampByUserID(context.Context, *SsKeyword, *UserStampsRes) error
	GetUserStampByStampID(context.Context, *SsKeyword, *UserStampsRes) error
	CreateServiceItem(context.Context, *ServiceItem, *SsKeyword) error
	UpdateServiceItem(context.Context, *ServiceItem, *SsUpdateRes) error
	GetServiceItem(context.Context, *SsKeyword, *ServiceItem) error
	GetServiceItemsBySceneryspotID(context.Context, *SsKeyword, *ServiceItemsRes) error
	GetServiceItemsByCategory(context.Context, *SsKeywordByCategory, *ServiceItemsRes) error
	CreateSceneryspot(context.Context, *Sceneryspot, *SsKeyword) error
	UpdateSceneryspot(context.Context, *Sceneryspot, *SsUpdateRes) error
	GetSceneryspot(context.Context, *SsKeyword, *Sceneryspot) error
	GetSceneryspots(context.Context, *SsEmptyReq, *SceneryspotsRes) error
	GetSceneryspotsByIDs(context.Context, *SsKeywords, *SceneryspotsRes) error
	CreateUserSceneryspot(context.Context, *UserSceneryspot, *UserSceneryspotResponse) error
	GetUserSceneryspots(context.Context, *UserSceneryspotRequest, *UserSceneryspotResponse) error
	GetUserStamp(context.Context, *UserStampRequest, *UserStampsRes) error
	UpdateUserStampRecord(context.Context, *UserStampRecordReq, *SsUpdateRes) error
	GetUserStampPointsRecord(context.Context, *UserStampPointsRecordReq, *UserStampPointsRecordRes) error
}

func RegisterSceneryspotServiceHandler(s server.Server, hdlr SceneryspotServiceHandler, opts ...server.HandlerOption) error {
	type sceneryspotService interface {
		CreateStamp(ctx context.Context, in *Stamp, out *SsKeyword) error
		UpdateStamp(ctx context.Context, in *Stamp, out *SsUpdateRes) error
		GetStamp(ctx context.Context, in *SsKeyword, out *Stamp) error
		GetStampsBySceneryspotID(ctx context.Context, in *SsKeyword, out *StampsRes) error
		CreateUserStamp(ctx context.Context, in *UserStamp, out *UserStampsRes) error
		UpdateUserStamp(ctx context.Context, in *UserStamp, out *UserStampsRes) error
		GetUserStampByUserID(ctx context.Context, in *SsKeyword, out *UserStampsRes) error
		GetUserStampByStampID(ctx context.Context, in *SsKeyword, out *UserStampsRes) error
		CreateServiceItem(ctx context.Context, in *ServiceItem, out *SsKeyword) error
		UpdateServiceItem(ctx context.Context, in *ServiceItem, out *SsUpdateRes) error
		GetServiceItem(ctx context.Context, in *SsKeyword, out *ServiceItem) error
		GetServiceItemsBySceneryspotID(ctx context.Context, in *SsKeyword, out *ServiceItemsRes) error
		GetServiceItemsByCategory(ctx context.Context, in *SsKeywordByCategory, out *ServiceItemsRes) error
		CreateSceneryspot(ctx context.Context, in *Sceneryspot, out *SsKeyword) error
		UpdateSceneryspot(ctx context.Context, in *Sceneryspot, out *SsUpdateRes) error
		GetSceneryspot(ctx context.Context, in *SsKeyword, out *Sceneryspot) error
		GetSceneryspots(ctx context.Context, in *SsEmptyReq, out *SceneryspotsRes) error
		GetSceneryspotsByIDs(ctx context.Context, in *SsKeywords, out *SceneryspotsRes) error
		CreateUserSceneryspot(ctx context.Context, in *UserSceneryspot, out *UserSceneryspotResponse) error
		GetUserSceneryspots(ctx context.Context, in *UserSceneryspotRequest, out *UserSceneryspotResponse) error
		GetUserStamp(ctx context.Context, in *UserStampRequest, out *UserStampsRes) error
		UpdateUserStampRecord(ctx context.Context, in *UserStampRecordReq, out *SsUpdateRes) error
		GetUserStampPointsRecord(ctx context.Context, in *UserStampPointsRecordReq, out *UserStampPointsRecordRes) error
	}
	type SceneryspotService struct {
		sceneryspotService
	}
	h := &sceneryspotServiceHandler{hdlr}
	return s.Handle(s.NewHandler(&SceneryspotService{h}, opts...))
}

type sceneryspotServiceHandler struct {
	SceneryspotServiceHandler
}

func (h *sceneryspotServiceHandler) CreateStamp(ctx context.Context, in *Stamp, out *SsKeyword) error {
	return h.SceneryspotServiceHandler.CreateStamp(ctx, in, out)
}

func (h *sceneryspotServiceHandler) UpdateStamp(ctx context.Context, in *Stamp, out *SsUpdateRes) error {
	return h.SceneryspotServiceHandler.UpdateStamp(ctx, in, out)
}

func (h *sceneryspotServiceHandler) GetStamp(ctx context.Context, in *SsKeyword, out *Stamp) error {
	return h.SceneryspotServiceHandler.GetStamp(ctx, in, out)
}

func (h *sceneryspotServiceHandler) GetStampsBySceneryspotID(ctx context.Context, in *SsKeyword, out *StampsRes) error {
	return h.SceneryspotServiceHandler.GetStampsBySceneryspotID(ctx, in, out)
}

func (h *sceneryspotServiceHandler) CreateUserStamp(ctx context.Context, in *UserStamp, out *UserStampsRes) error {
	return h.SceneryspotServiceHandler.CreateUserStamp(ctx, in, out)
}

func (h *sceneryspotServiceHandler) UpdateUserStamp(ctx context.Context, in *UserStamp, out *UserStampsRes) error {
	return h.SceneryspotServiceHandler.UpdateUserStamp(ctx, in, out)
}

func (h *sceneryspotServiceHandler) GetUserStampByUserID(ctx context.Context, in *SsKeyword, out *UserStampsRes) error {
	return h.SceneryspotServiceHandler.GetUserStampByUserID(ctx, in, out)
}

func (h *sceneryspotServiceHandler) GetUserStampByStampID(ctx context.Context, in *SsKeyword, out *UserStampsRes) error {
	return h.SceneryspotServiceHandler.GetUserStampByStampID(ctx, in, out)
}

func (h *sceneryspotServiceHandler) CreateServiceItem(ctx context.Context, in *ServiceItem, out *SsKeyword) error {
	return h.SceneryspotServiceHandler.CreateServiceItem(ctx, in, out)
}

func (h *sceneryspotServiceHandler) UpdateServiceItem(ctx context.Context, in *ServiceItem, out *SsUpdateRes) error {
	return h.SceneryspotServiceHandler.UpdateServiceItem(ctx, in, out)
}

func (h *sceneryspotServiceHandler) GetServiceItem(ctx context.Context, in *SsKeyword, out *ServiceItem) error {
	return h.SceneryspotServiceHandler.GetServiceItem(ctx, in, out)
}

func (h *sceneryspotServiceHandler) GetServiceItemsBySceneryspotID(ctx context.Context, in *SsKeyword, out *ServiceItemsRes) error {
	return h.SceneryspotServiceHandler.GetServiceItemsBySceneryspotID(ctx, in, out)
}

func (h *sceneryspotServiceHandler) GetServiceItemsByCategory(ctx context.Context, in *SsKeywordByCategory, out *ServiceItemsRes) error {
	return h.SceneryspotServiceHandler.GetServiceItemsByCategory(ctx, in, out)
}

func (h *sceneryspotServiceHandler) CreateSceneryspot(ctx context.Context, in *Sceneryspot, out *SsKeyword) error {
	return h.SceneryspotServiceHandler.CreateSceneryspot(ctx, in, out)
}

func (h *sceneryspotServiceHandler) UpdateSceneryspot(ctx context.Context, in *Sceneryspot, out *SsUpdateRes) error {
	return h.SceneryspotServiceHandler.UpdateSceneryspot(ctx, in, out)
}

func (h *sceneryspotServiceHandler) GetSceneryspot(ctx context.Context, in *SsKeyword, out *Sceneryspot) error {
	return h.SceneryspotServiceHandler.GetSceneryspot(ctx, in, out)
}

func (h *sceneryspotServiceHandler) GetSceneryspots(ctx context.Context, in *SsEmptyReq, out *SceneryspotsRes) error {
	return h.SceneryspotServiceHandler.GetSceneryspots(ctx, in, out)
}

func (h *sceneryspotServiceHandler) GetSceneryspotsByIDs(ctx context.Context, in *SsKeywords, out *SceneryspotsRes) error {
	return h.SceneryspotServiceHandler.GetSceneryspotsByIDs(ctx, in, out)
}

func (h *sceneryspotServiceHandler) CreateUserSceneryspot(ctx context.Context, in *UserSceneryspot, out *UserSceneryspotResponse) error {
	return h.SceneryspotServiceHandler.CreateUserSceneryspot(ctx, in, out)
}

func (h *sceneryspotServiceHandler) GetUserSceneryspots(ctx context.Context, in *UserSceneryspotRequest, out *UserSceneryspotResponse) error {
	return h.SceneryspotServiceHandler.GetUserSceneryspots(ctx, in, out)
}

func (h *sceneryspotServiceHandler) GetUserStamp(ctx context.Context, in *UserStampRequest, out *UserStampsRes) error {
	return h.SceneryspotServiceHandler.GetUserStamp(ctx, in, out)
}

func (h *sceneryspotServiceHandler) UpdateUserStampRecord(ctx context.Context, in *UserStampRecordReq, out *SsUpdateRes) error {
	return h.SceneryspotServiceHandler.UpdateUserStampRecord(ctx, in, out)
}

func (h *sceneryspotServiceHandler) GetUserStampPointsRecord(ctx context.Context, in *UserStampPointsRecordReq, out *UserStampPointsRecordRes) error {
	return h.SceneryspotServiceHandler.GetUserStampPointsRecord(ctx, in, out)
}
