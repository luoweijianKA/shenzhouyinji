package handler

import (
	"context"
	"time"

	pb "gitlab.com/annoying-orange/shenzhouyinji/service/event/proto"
	repo "gitlab.com/annoying-orange/shenzhouyinji/service/event/repository"
)

type Handler struct {
	Repository repo.Repository
}

// Event
func (h *Handler) CreateEvent(ctx context.Context, req *pb.Event, res *pb.EsKeyword) error {
	result, err := h.Repository.CreateEvent(ctx, req)

	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) UpdateEvent(ctx context.Context, req *pb.Event, res *pb.EsUpdateRes) error {
	result, err := h.Repository.UpdateEvent(ctx, req)

	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) GetEvent(ctx context.Context, req *pb.EsKeyword, res *pb.Event) error {
	result, err := h.Repository.GetEvent(ctx, req)
	if err != nil {
		if err.Error() == repo.ErrNotRecord.Error() {
			return nil
		}
		return err
	}

	res.Id = result.Id
	res.Code = result.Code
	res.Name = result.Name
	res.StartTime = result.StartTime
	res.EndTime = result.EndTime
	res.Images = result.Images
	res.Step = result.Step
	res.Introduction = result.Introduction
	res.Status = result.Status
	res.CreateTime = result.CreateTime
	res.EnableAward = result.EnableAward
	res.CategoryId = result.CategoryId

	return nil
}

func (h *Handler) GetEvents(ctx context.Context, req *pb.EsEmptyReq, res *pb.EventsRes) error {
	result, err := h.Repository.GetEvents(ctx, req)
	if err != nil {
		return err
	}

	res.Data = result.Data

	return nil
}

// EventScenerySpots
func (h *Handler) CreateEventScenerySpots(ctx context.Context, req *pb.EventScenerySpots, res *pb.EventScenerySpots) error {
	result, err := h.Repository.CreateEventScenerySpots(ctx, req)

	if err != nil {
		return err
	}

	res.EventId = result.EventId
	res.ScenerySpotId = result.ScenerySpotId

	return nil
}

func (h *Handler) RemoveEventScenerySpots(ctx context.Context, req *pb.EventScenerySpots, res *pb.EsUpdateRes) error {
	result, err := h.Repository.RemoveEventScenerySpots(ctx, req)

	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) GetEventScenerySpots(ctx context.Context, req *pb.EsKeyword, res *pb.EventScenerySpotsRes) error {
	result, err := h.Repository.GetEventScenerySpots(ctx, req)

	if err != nil {
		return err
	}

	res.Data = result.Data

	return nil
}

// Badge
func (h *Handler) CreateBadge(ctx context.Context, req *pb.Badge, res *pb.EsKeyword) error {
	result, err := h.Repository.CreateBadge(ctx, req)

	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) UpdateBadge(ctx context.Context, req *pb.Badge, res *pb.EsUpdateRes) error {
	result, err := h.Repository.UpdateBadge(ctx, req)

	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) DeleteBadge(ctx context.Context, in *pb.Badge, out *pb.BadgesRes) error {
	return h.Repository.DeleteBadge(ctx, in, out)
}

func (h *Handler) GetBadge(ctx context.Context, req *pb.EsKeyword, res *pb.Badge) error {
	result, err := h.Repository.GetBadge(ctx, req)

	if err != nil {
		return err
	}

	res.Id = result.Id
	res.EventId = result.EventId
	res.Name = result.Name
	res.Images = result.Images

	return nil
}

func (h *Handler) GetBadgesByEventID(ctx context.Context, req *pb.EsKeyword, res *pb.BadgesRes) error {
	result, err := h.Repository.GetBadgesByEventID(ctx, req)
	if err != nil {
		return err
	}

	res.Data = result.Data

	return nil
}

// UserBadge
func (h *Handler) CreateUserBadge(ctx context.Context, req *pb.UserBadge, res *pb.UserBadge) error {
	result, err := h.Repository.CreateUserBadge(ctx, req)

	if err != nil {
		return err
	}

	res.UserId = result.UserId
	res.BadgeId = result.BadgeId
	res.Status = result.Status

	return nil
}

func (h *Handler) UpdateUserBadge(ctx context.Context, req *pb.UserBadge, res *pb.EsUpdateRes) error {
	result, err := h.Repository.UpdateUserBadge(ctx, req)

	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) RemoveUserBadge(ctx context.Context, req *pb.UserBadge, res *pb.EsUpdateRes) error {
	result, err := h.Repository.RemoveUserBadge(ctx, req)

	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) GetUserBadgeByUserID(ctx context.Context, req *pb.EsKeyword, res *pb.UserBadgesRes) error {
	result, err := h.Repository.GetUserBadgeByUserID(ctx, req)

	if err != nil {
		return err
	}

	res.Data = result.Data

	return nil
}

// UserBadgeSwap
func (h *Handler) CreateUserBadgeSwap(ctx context.Context, req *pb.UserBadgeSwap, res *pb.EsKeyword) error {
	result, err := h.Repository.CreateUserBadgeSwap(ctx, req)

	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) UpdateUserBadgeSwap(ctx context.Context, req *pb.UserBadgeSwap, res *pb.EsUpdateRes) error {
	result, err := h.Repository.UpdateUserBadgeSwap(ctx, req)

	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) GetUserBadgeSwap(ctx context.Context, req *pb.EsKeyword, res *pb.UserBadgeSwap) error {
	result, err := h.Repository.GetUserBadgeSwap(ctx, req)

	if err != nil {
		return err
	}

	res.Id = result.Id
	res.BadgeId = result.BadgeId
	res.From = result.From
	res.To = result.To
	res.PreviousId = result.PreviousId
	res.City = result.City
	res.Content = result.Content
	res.Status = result.Status
	res.CreateTime = result.CreateTime

	return nil
}

func (h *Handler) GetUserBadgeSwapByPreviousID(ctx context.Context, req *pb.EsKeyword, res *pb.UserBadgeSwap) error {
	result, err := h.Repository.GetUserBadgeSwapByPreviousID(ctx, req)

	if err != nil {
		return err
	}

	res.BadgeId = result.BadgeId
	res.From = result.From
	res.To = result.To
	res.PreviousId = result.PreviousId
	res.City = result.City
	res.Content = result.Content
	res.Status = result.Status
	res.CreateTime = result.CreateTime

	return nil
}

func (h *Handler) GetUserBadgeSwapByFrom(ctx context.Context, req *pb.EsKeyword, res *pb.UserBadgeSwapsRes) error {
	result, err := h.Repository.GetUserBadgeSwapByFrom(ctx, req)

	if err != nil {
		return err
	}

	res.Data = result.Data

	return nil
}

func (h *Handler) GetUserBadgeSwapByTo(ctx context.Context, req *pb.EsKeyword, res *pb.UserBadgeSwapsRes) error {
	result, err := h.Repository.GetUserBadgeSwapByTo(ctx, req)

	if err != nil {
		return err
	}

	res.Data = result.Data

	return nil
}

// PassportSet
func (h *Handler) CreatePassportSet(ctx context.Context, req *pb.PassportSet, res *pb.EsKeyword) error {
	result, err := h.Repository.CreatePassportSet(ctx, req)

	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) UpdatePassportSet(ctx context.Context, req *pb.PassportSet, res *pb.EsUpdateRes) error {
	result, err := h.Repository.UpdatePassportSet(ctx, req)

	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) GetPassportSet(ctx context.Context, req *pb.EsKeyword, res *pb.PassportSet) error {
	result, err := h.Repository.GetPassportSet(ctx, req)

	if err != nil {
		return err
	}

	res.Id = result.Id
	res.EventId = result.EventId
	res.Name = result.Name
	res.Status = result.Status
	res.Quantity = result.Quantity
	res.Issued = result.Issued

	return nil
}

func (h *Handler) GetPassportSetByName(ctx context.Context, req *pb.EsKeyword, res *pb.PassportSet) error {
	result, err := h.Repository.GetPassportSetByName(ctx, req)

	if err != nil {
		return err
	}

	res.Id = result.Id
	res.EventId = result.EventId
	res.Name = result.Name
	res.Status = result.Status
	res.Quantity = result.Quantity
	res.Issued = result.Issued

	return nil
}

func (h *Handler) GetPassportSetByEventID(ctx context.Context, req *pb.EsKeyword, res *pb.PassportSetsRes) error {
	result, err := h.Repository.GetPassportSetByEventID(ctx, req)

	if err != nil {
		return err
	}

	res.Data = result.Data

	return nil
}

// Passport
func (h *Handler) CreatePassport(ctx context.Context, req *pb.Passport, res *pb.EsKeyword) error {
	result, err := h.Repository.CreatePassport(ctx, req)

	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) UpdatePassport(ctx context.Context, req *pb.Passport, res *pb.EsUpdateRes) error {
	result, err := h.Repository.UpdatePassport(ctx, req)

	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) GetPassport(ctx context.Context, req *pb.EsKeyword, res *pb.Passport) error {
	result, err := h.Repository.GetPassport(ctx, req)

	if err != nil {
		return err
	}

	res.Id = result.Id
	res.PassportSetId = result.PassportSetId
	res.Code = result.Code
	res.Status = result.Status

	return nil
}

func (h *Handler) GetPassportByCode(ctx context.Context, req *pb.EsKeyword, res *pb.Passport) error {
	result, err := h.Repository.GetPassportByCode(ctx, req)

	if err != nil {
		return err
	}

	res.Id = result.Id
	res.PassportSetId = result.PassportSetId
	res.Code = result.Code
	res.Status = result.Status

	return nil
}

func (h *Handler) GetPassportByPassportSetID(ctx context.Context, req *pb.EsKeyword, res *pb.PassportsRes) error {
	result, err := h.Repository.GetPassportByPassportSetID(ctx, req)

	if err != nil {
		return err
	}

	res.Data = result.Data

	return nil
}

func (h *Handler) GetPassports(ctx context.Context, in *pb.PassportRequest, out *pb.PassportsRes) error {
	return h.Repository.GetPassports(ctx, in, out)
}

func (h *Handler) DeletePassport(ctx context.Context, in *pb.DeletePassportRequest, out *pb.PassportsRes) error {
	if len(in.Values) == 0 {
		return nil
	}
	return h.Repository.DeletePassport(ctx, in, out)
}

func (h *Handler) SearchPassports(ctx context.Context, in *pb.SearchPassportRequest, out *pb.SearchPassportResponse) error {
	return h.Repository.SearchPassports(ctx, in, out)
}

// UserPassport
func (h *Handler) CreateUserPassport(ctx context.Context, req *pb.UserPassport, res *pb.EsKeyword) error {
	result, err := h.Repository.CreateUserPassport(ctx, req)

	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) UpdateUserPassport(ctx context.Context, req *pb.UserPassport, res *pb.EsUpdateRes) error {
	result, err := h.Repository.UpdateUserPassport(ctx, req)
	if err != nil {
		return err
	}
	res.Value = result.Value

	return nil
}

func (h *Handler) GetUserPassport(ctx context.Context, in *pb.UserPassport, out *pb.UserPassport) error {
	return h.Repository.GetUserPassport(ctx, in, out)
}

func (h *Handler) GetUserPassportByUserID(ctx context.Context, req *pb.EsKeyword, res *pb.UserPassportsRes) error {
	result, err := h.Repository.GetUserPassportByUserID(ctx, req)

	if err != nil {
		return err
	}

	res.Data = result.Data

	return nil
}

func (h *Handler) GetUserPassportByPassportID(ctx context.Context, req *pb.EsKeyword, res *pb.UserPassport) error {
	result, err := h.Repository.GetUserPassportByPassportID(ctx, req)

	if err != nil {
		return err
	}

	res.Id = result.Id
	res.UserId = result.UserId
	res.EventId = result.EventId
	res.PassportCode = result.PassportCode
	res.RealName = result.RealName
	res.Nric = result.Nric
	res.Phone = result.Phone
	res.Gender = result.Gender
	res.Profession = result.Profession
	res.ClaimCode = result.ClaimCode
	res.Authentication = result.Authentication
	res.GuardianName = result.GuardianName
	res.GuardianNric = result.GuardianNric
	res.GuardianPhone = result.GuardianPhone
	res.ClaimTime = result.ClaimTime
	res.Status = result.Status

	return nil
}

func (h *Handler) GetUserPassportByGuardianName(ctx context.Context, req *pb.EsKeyword, res *pb.UserPassportsRes) error {
	result, err := h.Repository.GetUserPassportByGuardianName(ctx, req)

	if err != nil {
		return err
	}

	res.Data = result.Data

	return nil

}

func (h *Handler) RemoveUserPassport(ctx context.Context, req *pb.EsKeyword, res *pb.EsUpdateRes) error {
	result, err := h.Repository.RemoveUserPassport(ctx, req)

	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) PickupUserPassport(ctx context.Context, req *pb.PickupPassportReq, res *pb.EsKeyword) error {
	result, err := h.Repository.PickupUserPassport(ctx, req)

	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) UpdateGuardianInfo(ctx context.Context, req *pb.GuardianInfoReq, res *pb.EsUpdateRes) error {
	result, err := h.Repository.UpdateGuardianInfo(ctx, req)

	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) VerifyUserPassport(ctx context.Context, req *pb.VerifyPassportReq, res *pb.EsUpdateRes) error {
	result, err := h.Repository.VerifyUserPassport(ctx, req)

	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) GetPickupCodeInfo(ctx context.Context, req *pb.EsKeyword, res *pb.PickupCodeRes) error {
	result, err := h.Repository.GetPickupCodeInfo(ctx, req)

	if err != nil {
		return err
	}

	res.UserId = result.UserId
	res.RealName = result.RealName
	res.Nric = result.Nric
	res.Phone = result.Phone
	res.Authentication = result.Authentication
	res.Status = result.Status

	return nil
}

func (h *Handler) ActivateUserPassport(ctx context.Context, req *pb.ActivatePassportReq, res *pb.EsUpdateRes) error {
	result, err := h.Repository.ActivateUserPassport(ctx, req)

	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

// Camp

func (h *Handler) CreateCamp(ctx context.Context, req *pb.Camp, res *pb.EsKeyword) error {
	result, err := h.Repository.CreateCamp(ctx, req)

	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) UpdateCamp(ctx context.Context, req *pb.Camp, res *pb.EsUpdateRes) error {
	result, err := h.Repository.UpdateCamp(ctx, req)

	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) GetCamp(ctx context.Context, req *pb.EsKeyword, res *pb.Camp) error {
	result, err := h.Repository.GetCamp(ctx, req)
	if err != nil {
		if err.Error() == repo.ErrNotRecord.Error() {
			res = nil
			return nil
		}
		return err
	}

	res.Id = result.Id
	res.EventId = result.EventId
	res.Name = result.Name
	res.Introduction = result.Introduction
	res.Images = result.Images
	res.Points = result.Points
	res.Status = result.Status
	res.CategoryId = result.CategoryId

	return nil
}

func (h *Handler) GetCampByEventID(ctx context.Context, req *pb.EsKeyword, res *pb.CampsRes) error {
	result, err := h.Repository.GetCampByEventID(ctx, req)

	if err != nil {
		return err
	}

	res.Data = result.Data

	return nil
}

func (h *Handler) GetCampWithUser(ctx context.Context, in *pb.CampWithUserRequest, out *pb.CampsRes) error {
	return h.Repository.GetCampWithUser(ctx, in, out)
}

// Honour
func (h *Handler) CreateHonour(ctx context.Context, req *pb.Honour, res *pb.EsKeyword) error {
	result, err := h.Repository.CreateHonour(ctx, req)

	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) UpdateHonour(ctx context.Context, req *pb.Honour, res *pb.EsUpdateRes) error {
	result, err := h.Repository.UpdateHonour(ctx, req)

	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) GetHonour(ctx context.Context, req *pb.EsKeyword, res *pb.Honour) error {
	result, err := h.Repository.GetHonour(ctx, req)

	if err != nil {
		return err
	}

	res.Id = result.Id
	res.CampId = result.CampId
	res.Name = result.Name
	res.Images = result.Images
	res.MinPoints = result.MinPoints
	res.MaxPoints = result.MaxPoints
	res.Status = result.Status

	return nil
}

func (h *Handler) GetHonourByCampID(ctx context.Context, req *pb.EsKeyword, res *pb.HonoursRes) error {
	result, err := h.Repository.GetHonourByCampID(ctx, req)

	if err != nil {
		return err
	}

	res.Data = result.Data

	return nil
}

// UserCamp
func (h *Handler) CreateUserCamp(ctx context.Context, req *pb.UserCamp, res *pb.EsKeyword) error {
	result, err := h.Repository.CreateUserCamp(ctx, req)

	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) UpdateUserCamp(ctx context.Context, req *pb.UserCamp, res *pb.EsUpdateRes) error {
	result, err := h.Repository.UpdateUserCamp(ctx, req)

	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) GetUserCamp(ctx context.Context, req *pb.EsKeyword, res *pb.UserCamp) error {
	result, err := h.Repository.GetUserCamp(ctx, req)

	if err != nil {
		return err
	}

	res.UserId = result.UserId
	res.CampId = result.CampId
	res.Honour = result.Honour
	res.Points = result.Points
	res.StampCount = result.StampCount
	res.Status = result.Status
	res.CreateTime = result.CreateTime

	return nil
}

func (h *Handler) GetUserCampByCampID(ctx context.Context, req *pb.EsKeyword, res *pb.UserCampsRes) error {
	result, err := h.Repository.GetUserCampByCampID(ctx, req)

	if err != nil {
		return err
	}

	res.Data = result.Data

	return nil
}

func (h *Handler) GetPassportStocks(ctx context.Context, in *pb.PassportStocksRequest, out *pb.PassportStocksResponse) error {
	return h.Repository.GetPassportStocks(ctx, in, out)
}

func (h *Handler) GetIssuedUserPassports(ctx context.Context, in *pb.UserPassportRequest, out *pb.UserPassportsRes) error {
	return h.Repository.GetIssuedUserPassports(ctx, in, out)
}

func (h *Handler) GetUsedUserPassports(ctx context.Context, in *pb.UserPassportRequest, out *pb.UserPassportsRes) error {
	return h.Repository.GetUsedUserPassports(ctx, in, out)
}

func (h *Handler) GetInactiveUserPassports(ctx context.Context, in *pb.UserPassportRequest, out *pb.UserPassportsRes) error {
	return h.Repository.GetInactiveUserPassports(ctx, in, out)
}

func (h *Handler) GetUserEventPassport(ctx context.Context, in *pb.UserEventPassportRequest, out *pb.UserEventPassportResponse) error {
	return h.Repository.GetUserEventPassport(ctx, in, out)
}

func (h *Handler) CheckUserEventPassport(ctx context.Context, in *pb.UserPassport, out *pb.UserEventPassportResponse) error {
	return h.Repository.CheckUserEventPassport(ctx, in, out)
}

func (h *Handler) CreateUserEventPassport(ctx context.Context, in *pb.UserPassport, out *pb.CreateUserEventPassportResponse) error {
	return h.Repository.CreateUserEventPassport(ctx, in, out)
}

func (h *Handler) ActivateUserEventPassport(ctx context.Context, in *pb.ActivateUserEventPassportRequest, out *pb.ActivateUserEventPassportResponse) error {
	return h.Repository.ActivateUserEventPassport(ctx, in, out)
}

func (h *Handler) GetClaimEventPassports(ctx context.Context, in *pb.ActivateUserEventPassportRequest, out *pb.ActivateUserEventPassportResponse) error {
	return h.Repository.GetClaimEventPassports(ctx, in, out)
}

func (h *Handler) GetEventUsers(ctx context.Context, in *pb.EventUserRequest, out *pb.EventUserResponse) error {
	return h.Repository.GetEventUsers(ctx, in, out)
}

func (h *Handler) UpdateEventUserPoints(ctx context.Context, in *pb.EventUserPoints, out *pb.EventUserPointsResponse) error {
	return h.Repository.UpdateEventUserPoints(ctx, in, out)
}

func (h *Handler) IncrementEventUserPoints(ctx context.Context, in *pb.EventUserPoints, out *pb.EventUserPointsResponse) error {
	return h.Repository.IncrementEventUserPoints(ctx, in, out)
}

func (h *Handler) GetEventTasks(ctx context.Context, in *pb.EventTaskRequest, out *pb.EventTaskResponse) error {
	return h.Repository.GetEventTasks(ctx, in, out)
}

func (h *Handler) GetCampRanks(ctx context.Context, in *pb.CampRankRequest, out *pb.CampRankResponse) error {
	return h.Repository.GetCampRanks(ctx, in, out)
}

func (h *Handler) GetUserRanks(ctx context.Context, in *pb.UserRankRequest, out *pb.UserRankResponse) error {
	return h.Repository.GetUserRanks(ctx, in, out)
}

func (h *Handler) GetUserEvents(ctx context.Context, in *pb.UserEventRequest, out *pb.UserEventResponse) error {
	return h.Repository.GetUserEvents(ctx, in, out)
}

func (h *Handler) GetUserSwaps(ctx context.Context, in *pb.UserSwapRequest, out *pb.UserSwapResponse) error {
	return h.Repository.GetUserSwaps(ctx, in, out)
}

func (h *Handler) CreateUserSwap(ctx context.Context, in *pb.CreateUserSwapRequest, out *pb.UserSwapResponse) error {
	if err := h.Repository.CreateUserSwap(ctx, in, out); err != nil {
		return nil
	}

	return h.Repository.GetUserSwaps(ctx, &pb.UserSwapRequest{Id: in.Id}, out)
}

func (h *Handler) UpdateUserSwap(ctx context.Context, in *pb.UpdateUserSwapRequest, out *pb.UserSwapResponse) error {
	if err := h.Repository.UpdateUserSwap(ctx, in, out); err != nil {
		return nil
	}

	return h.Repository.GetUserSwaps(ctx, &pb.UserSwapRequest{Id: in.Id}, out)
}

func (h *Handler) GetEventSettings(ctx context.Context, in *pb.EventSettingsRequest, out *pb.EventSettingsResponse) error {
	return h.Repository.GetEventSettings(ctx, in, out)
}

func (h *Handler) UpdateEventSettings(ctx context.Context, in *pb.UpdateEventSettingsRequest, out *pb.EventSettingsResponse) error {
	return h.Repository.UpdateEventSettings(ctx, in, out)
}

func (h *Handler) CreateEventAward(ctx context.Context, in *pb.CreateEventAwardRequest, out *pb.EventAwardResponse) error {
	return h.Repository.CreateEventAward(ctx, in, out)
}

func (h *Handler) GetEventAwards(ctx context.Context, in *pb.EventAwardRequest, out *pb.EventAwardResponse) error {
	return h.Repository.GetEventAwards(ctx, in, out)
}

func (h *Handler) UpdateEventAward(ctx context.Context, in *pb.EventAward, out *pb.EventAwardResponse) error {
	return h.Repository.UpdateEventAward(ctx, in, out)
}

func (h *Handler) DeleteEventAward(ctx context.Context, in *pb.DeleteEventAwardRequest, out *pb.EventAwardResponse) error {
	return h.Repository.DeleteEventAward(ctx, in, out)
}

func (h *Handler) GetNewEventAwards(ctx context.Context, in *pb.NewEventAwardRequest, out *pb.EventAwardResponse) error {
	return h.Repository.GetNewEventAwards(ctx, in, out)
}

func (h *Handler) GetUserEventAwards(ctx context.Context, in *pb.UserEventAwardRequest, out *pb.EventAwardResponse) error {
	repo := h.Repository
	if err := repo.GetEventAwards(
		ctx,
		&pb.EventAwardRequest{EventId: in.EventId, UserId: in.UserId, SceneryspotId: in.SceneryspotId},
		out,
	); err != nil {
		return nil
	}

	if len(out.Data) == 0 {
		if err := repo.GetNewEventAwards(ctx, &pb.NewEventAwardRequest{EventId: in.EventId, SceneryspotId: in.SceneryspotId, Count: 1}, out); err != nil {
			return err
		}
		if len(out.Data) == 0 {
			return nil
		}
		data := out.Data[0]
		data.UserId = in.UserId
		data.Location = in.Location
		data.AwardTime = int32(time.Now().Unix())
		return repo.UpdateEventAward(ctx, data, out)
	}
	return nil
}

func (h *Handler) UnbindUserPassport(ctx context.Context, in *pb.EsKeyword, out *pb.UserPassportsRes) error {
	return h.Repository.UnbindUserPassport(ctx, in, out)
}

func (h *Handler) DeleteUserPassport(ctx context.Context, in *pb.EsKeyword, out *pb.UserPassportsRes) error {
	return h.Repository.DeleteUserPassport(ctx, in, out)
}

func (h *Handler) UpdateUserStampCount(ctx context.Context, in *pb.UserStampCountRequest, out *pb.UserStampCountResponse) error {
	return h.Repository.UpdateUserStampCount(ctx, in, out)
}

func (h *Handler) IncrementUserStampCount(ctx context.Context, in *pb.UserStampCountRequest, out *pb.UserStampCountResponse) error {
	return h.Repository.IncrementUserStampCount(ctx, in, out)
}

func (h *Handler) GetExportPassports(ctx context.Context, in *pb.ExportPassportRequest, out *pb.ExportPassportResponse) error {
	return h.Repository.GetExportPassports(ctx, in, out)
}
