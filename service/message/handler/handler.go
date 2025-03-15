package handler

import (
	"context"

	pb "gitlab.com/annoying-orange/shenzhouyinji/service/message/proto"
	repo "gitlab.com/annoying-orange/shenzhouyinji/service/message/repository"
)

type Handler struct {
	Repository repo.Repository
}

func (h *Handler) CreateNotification(ctx context.Context, req *pb.Notification, res *pb.MsgsKeyword) error {
	result, err := h.Repository.CreateNotification(ctx, req)

	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) UpdateNotification(ctx context.Context, in *pb.Notification, out *pb.NotificationsRes) error {
	return h.Repository.UpdateNotification(ctx, in, out)
}

func (h *Handler) DeleteNotification(ctx context.Context, in *pb.DeleteNotificationRequest, out *pb.NotificationsRes) error {
	return h.Repository.DeleteNotification(ctx, in, out)
}

func (h *Handler) GetNotification(ctx context.Context, req *pb.MsgsKeyword, res *pb.Notification) error {
	result, err := h.Repository.GetNotification(ctx, req)

	if err != nil {
		return err
	}

	res.Id = result.Id
	res.Name = result.Name
	res.CategoryId = result.CategoryId
	res.Content = result.Content
	res.Sender = result.Sender
	res.ReleaseTime = result.ReleaseTime
	res.BlockingTime = result.BlockingTime
	res.CreateTime = result.CreateTime

	return nil
}

func (h *Handler) GetNotifications(ctx context.Context, req *pb.MsgsEmptyReq, res *pb.NotificationsRes) error {
	result, err := h.Repository.GetNotifications(ctx, req)

	if err != nil {
		return err
	}

	res.Data = result.Data

	return nil
}

func (h *Handler) UpdateUserNotification(ctx context.Context, req *pb.UserNotification, res *pb.MsgsRes) error {
	result, err := h.Repository.UpdateUserNotification(ctx, req)

	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) GetUserNotifications(ctx context.Context, req *pb.MsgsKeyword, res *pb.UserNotificationsRes) error {
	result, err := h.Repository.GetUserNotifications(ctx, req)

	if err != nil {
		return err
	}

	res.Data = result.Data

	return nil
}

func (h *Handler) CreateConversation(ctx context.Context, req *pb.Conversation, res *pb.MsgsKeyword) error {
	result, err := h.Repository.CreateConversation(ctx, req)
	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) UpdateConversation(ctx context.Context, req *pb.Conversation, res *pb.MsgsRes) error {
	result, err := h.Repository.UpdateConversation(ctx, req)

	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) GetConversation(ctx context.Context, req *pb.MsgsKeyword, res *pb.Conversation) error {
	result, err := h.Repository.GetConversation(ctx, req)

	if err != nil {
		return err
	}

	res.Id = result.Id
	res.Participant = result.Participant
	res.From = result.From
	res.To = result.To
	res.Content = result.Content
	res.SendTime = result.SendTime
	res.ReadTime = result.ReadTime
	res.Status = result.Status

	return nil
}

func (h *Handler) GetParticipantConversations(ctx context.Context, in *pb.ParticipantConversationRequest, out *pb.ConversationsResponse) error {
	if err := h.Repository.ReadConversations(ctx, in); err != nil {
		return err
	}

	return h.Repository.GetParticipantConversations(ctx, in, out)
}

func (h *Handler) GetUserConversations(ctx context.Context, in *pb.UserConversationRequest, out *pb.UserConversationResponse) error {
	return h.Repository.GetUserConversations(ctx, in, out)
}

func (h *Handler) GetServiceConversations(ctx context.Context, in *pb.UserConversationRequest, out *pb.UserConversationResponse) error {
	return h.Repository.GetServiceConversations(ctx, in, out)
}

func (h *Handler) GetUserUnreadMessage(ctx context.Context, req *pb.MsgsKeyword, res *pb.UserUnreadMessage) error {
	if result, err := h.Repository.GetUserUnreadMessage(ctx, req); err == nil {
		res.UserId = result.UserId
		res.Notification = result.Notification
		res.Conversation = result.Conversation
		res.Followers = result.Followers
		res.Like = result.Like
		res.Share = result.Share
		res.View = result.View
		res.System = result.System
		res.CustomerService = result.CustomerService
		res.Reward = result.Reward
		res.Badge = result.Badge
	}

	return nil
}

func (h *Handler) ClearUserUnreadMessage(ctx context.Context, req *pb.ClearUserUnreadMessageReq, res *pb.MsgsRes) error {

	result, err := h.Repository.ClearUserUnreadMessage(ctx, req)

	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

// Tweet
func (h *Handler) CreateTweet(ctx context.Context, req *pb.Tweet, res *pb.MsgsKeyword) error {
	result, err := h.Repository.CreateTweet(ctx, req)

	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) UpdateTweet(ctx context.Context, req *pb.Tweet, res *pb.MsgsRes) error {
	result, err := h.Repository.UpdateTweet(ctx, req)

	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) RemoveTweet(ctx context.Context, in *pb.Tweet, out *pb.MsgsRes) error {
	return h.Repository.RemoveTweet(ctx, in, out)
}

func (h *Handler) GetTweet(ctx context.Context, req *pb.MsgsKeyword, res *pb.Tweet) error {
	result, err := h.Repository.GetTweet(ctx, req)

	if err != nil {
		return err
	}

	res.Id = result.Id
	res.UserId = result.UserId
	res.Content = result.Content
	res.LikeCount = result.LikeCount
	res.ShareCount = result.ShareCount
	res.ViewCount = result.ViewCount
	res.Status = result.Status
	res.CreateTime = result.CreateTime
	res.SceneryspotId = result.SceneryspotId
	res.EventId = result.EventId
	res.Location = result.Location
	res.Region = result.Region

	return nil
}

func (h *Handler) GetTweetByUserID(ctx context.Context, req *pb.MsgsKeyword, res *pb.TweetsRes) error {
	result, err := h.Repository.GetTweetByUserID(ctx, req)

	if err != nil {
		return err
	}

	res.Data = result.Data

	return nil
}

func (h *Handler) GetNewestTweet(ctx context.Context, req *pb.NewestTweetReq, res *pb.TweetsRes) error {
	result, err := h.Repository.GetNewestTweet(ctx, req)

	if err != nil {
		return err
	}

	res.Data = result.Data
	res.Total = result.Total

	return nil
}

func (h *Handler) GetUserTweet(ctx context.Context, in *pb.UserTweetRequest, out *pb.TweetsRes) error {
	return h.Repository.GetUserTweet(ctx, in, out)
}

func (h *Handler) LikeTweet(ctx context.Context, req *pb.TweetReq, res *pb.MsgsRes) error {
	result, err := h.Repository.LikeTweet(ctx, req)

	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) ShareTweet(ctx context.Context, req *pb.TweetReq, res *pb.MsgsRes) error {
	result, err := h.Repository.ShareTweet(ctx, req)

	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) ViewTweet(ctx context.Context, req *pb.TweetReq, res *pb.MsgsRes) error {
	result, err := h.Repository.ViewTweet(ctx, req)

	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) UnlikeTweet(ctx context.Context, req *pb.TweetReq, res *pb.MsgsRes) error {
	result, err := h.Repository.UnlikeTweet(ctx, req)

	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) GetUserLikedRecord(ctx context.Context, req *pb.MsgsKeyword, res *pb.UserLikeRecordsRes) error {
	result, err := h.Repository.GetUserLikedRecord(ctx, req)

	if err != nil {
		return err
	}

	res.Data = result.Data

	return nil
}

func (h *Handler) GetUserLikesRecord(ctx context.Context, req *pb.MsgsKeyword, res *pb.UserLikeRecordsRes) error {
	result, err := h.Repository.GetUserLikesRecord(ctx, req)

	if err != nil {
		return err
	}

	res.Data = result.Data

	return nil
}

func (h *Handler) GetTweetLikeRecord(ctx context.Context, req *pb.MsgsKeyword, res *pb.TweetLikeRecordRes) error {
	result, err := h.Repository.GetTweetLikeRecord(ctx, req)

	if err != nil {
		return err
	}

	res.Data = result.Data

	return nil
}

func (h *Handler) GetTweetShareRecord(ctx context.Context, req *pb.MsgsKeyword, res *pb.TweetShareRecordRes) error {
	result, err := h.Repository.GetTweetShareRecord(ctx, req)

	if err != nil {
		return err
	}

	res.Data = result.Data

	return nil
}

func (h *Handler) GetTweetViewRecord(ctx context.Context, req *pb.MsgsKeyword, res *pb.TweetViewRecordRes) error {
	result, err := h.Repository.GetTweetViewRecord(ctx, req)

	if err != nil {
		return err
	}

	res.Data = result.Data

	return nil
}

func (h *Handler) GetTweetLikers(ctx context.Context, req *pb.MsgsKeyword, res *pb.TweetUserRefRes) error {
	result, err := h.Repository.GetTweetLikers(ctx, req)

	if err != nil {
		return err
	}

	res.Data = result.Data

	return nil
}

func (h *Handler) GetTweetSharers(ctx context.Context, req *pb.MsgsKeyword, res *pb.TweetUserRefRes) error {
	result, err := h.Repository.GetTweetSharers(ctx, req)

	if err != nil {
		return err
	}

	res.Data = result.Data

	return nil
}

func (h *Handler) GetTweetViewers(ctx context.Context, req *pb.MsgsKeyword, res *pb.TweetUserRefRes) error {
	result, err := h.Repository.GetTweetViewers(ctx, req)

	if err != nil {
		return err
	}

	res.Data = result.Data

	return nil
}

func (h *Handler) GetTweetUserActionState(ctx context.Context, req *pb.MsgsKeyword, res *pb.TweetUserActionStateRes) error {
	result, err := h.Repository.GetTweetUserActionState(ctx, req)

	if err != nil {
		return err
	}

	res.Data = result.Data

	return nil
}

func (h *Handler) GetUserRecordByUserId(ctx context.Context, req *pb.UserRecordReq, res *pb.UserRecordRes) error {
	result, err := h.Repository.GetUserRecordByUserId(ctx, req)

	if err != nil {
		return err
	}

	res.Data = result.Data

	return nil
}

func (h *Handler) GetUserRecordByTweetUserId(ctx context.Context, req *pb.UserRecordReq, res *pb.UserRecordRes) error {
	result, err := h.Repository.GetUserRecordByTweetUserId(ctx, req)

	if err != nil {
		return err
	}

	res.Data = result.Data

	return nil
}

// Followers
func (h *Handler) CreateFollowers(ctx context.Context, req *pb.Followers, res *pb.MsgsRes) error {
	result, err := h.Repository.CreateFollowers(ctx, req)

	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) RemoveFollowers(ctx context.Context, req *pb.Followers, res *pb.MsgsRes) error {
	result, err := h.Repository.RemoveFollowers(ctx, req)

	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) GetFollowersByUserID(ctx context.Context, req *pb.MsgsKeyword, res *pb.FollowerssRes) error {
	result, err := h.Repository.GetFollowersByUserID(ctx, req)

	if err != nil {
		return err
	}

	res.Data = result.Data

	return nil
}

// Following
func (h *Handler) CreateFollowing(ctx context.Context, req *pb.Following, res *pb.MsgsRes) error {
	result, err := h.Repository.CreateFollowing(ctx, req)

	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) RemoveFollowing(ctx context.Context, req *pb.Following, res *pb.MsgsRes) error {
	result, err := h.Repository.RemoveFollowing(ctx, req)

	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) GetFollowingByUserID(ctx context.Context, req *pb.MsgsKeyword, res *pb.FollowingsRes) error {
	result, err := h.Repository.GetFollowingByUserID(ctx, req)

	if err != nil {
		return err
	}

	res.Data = result.Data

	return nil
}

func (h *Handler) GetTweets(ctx context.Context, in *pb.TweetRequest, out *pb.TweetResponse) error {
	return h.Repository.GetTweets(ctx, in, out)
}
