package repository

import (
	"context"
	"time"

	uuid "github.com/satori/go.uuid"
	aPB "gitlab.com/annoying-orange/shenzhouyinji/service/account/proto"
	pb "gitlab.com/annoying-orange/shenzhouyinji/service/message/proto"
	"gorm.io/gorm"
)

const (
	ErrNoRecord = "record not found"
)

type Repository interface {
	CreateNotification(ctx context.Context, item *pb.Notification) (*pb.MsgsKeyword, error)
	UpdateNotification(ctx context.Context, in *pb.Notification, out *pb.NotificationsRes) error
	DeleteNotification(ctx context.Context, in *pb.DeleteNotificationRequest, out *pb.NotificationsRes) error
	GetNotification(ctx context.Context, req *pb.MsgsKeyword) (*pb.Notification, error)
	GetNotifications(ctx context.Context, req *pb.MsgsEmptyReq) (*pb.NotificationsRes, error)

	UpdateUserNotification(ctx context.Context, item *pb.UserNotification) (*pb.MsgsRes, error)
	GetUserNotifications(ctx context.Context, req *pb.MsgsKeyword) (*pb.UserNotificationsRes, error)

	CreateConversation(ctx context.Context, item *pb.Conversation) (*pb.MsgsKeyword, error)
	UpdateConversation(ctx context.Context, item *pb.Conversation) (*pb.MsgsRes, error)
	GetConversation(ctx context.Context, req *pb.MsgsKeyword) (*pb.Conversation, error)
	GetParticipantConversations(ctx context.Context, in *pb.ParticipantConversationRequest, out *pb.ConversationsResponse) error
	GetUserConversations(ctx context.Context, in *pb.UserConversationRequest, out *pb.UserConversationResponse) error
	GetServiceConversations(ctx context.Context, in *pb.UserConversationRequest, out *pb.UserConversationResponse) error
	ReadConversations(ctx context.Context, in *pb.ParticipantConversationRequest) error

	GetUserUnreadMessage(ctx context.Context, req *pb.MsgsKeyword) (*pb.UserUnreadMessage, error)
	ClearUserUnreadMessage(ctx context.Context, req *pb.ClearUserUnreadMessageReq) (*pb.MsgsRes, error)

	CreateTweet(ctx context.Context, req *pb.Tweet) (*pb.MsgsKeyword, error)
	UpdateTweet(ctx context.Context, req *pb.Tweet) (*pb.MsgsRes, error)
	RemoveTweet(ctx context.Context, in *pb.Tweet, out *pb.MsgsRes) error
	GetTweet(ctx context.Context, req *pb.MsgsKeyword) (*pb.Tweet, error)
	GetTweetByUserID(ctx context.Context, req *pb.MsgsKeyword) (*pb.TweetsRes, error)
	GetNewestTweet(ctx context.Context, req *pb.NewestTweetReq) (*pb.TweetsRes, error)
	GetUserTweet(ctx context.Context, in *pb.UserTweetRequest, out *pb.TweetsRes) error

	LikeTweet(ctx context.Context, req *pb.TweetReq) (*pb.MsgsRes, error)
	UnlikeTweet(ctx context.Context, req *pb.TweetReq) (*pb.MsgsRes, error)
	GetUserLikedRecord(ctx context.Context, req *pb.MsgsKeyword) (*pb.UserLikeRecordsRes, error)
	GetUserLikesRecord(ctx context.Context, req *pb.MsgsKeyword) (*pb.UserLikeRecordsRes, error)

	CreateFollowers(ctx context.Context, req *pb.Followers) (*pb.MsgsRes, error)
	RemoveFollowers(ctx context.Context, req *pb.Followers) (*pb.MsgsRes, error)
	GetFollowersByUserID(ctx context.Context, req *pb.MsgsKeyword) (*pb.FollowerssRes, error)

	CreateFollowing(ctx context.Context, req *pb.Following) (*pb.MsgsRes, error)
	RemoveFollowing(ctx context.Context, req *pb.Following) (*pb.MsgsRes, error)
	GetFollowingByUserID(ctx context.Context, req *pb.MsgsKeyword) (*pb.FollowingsRes, error)

	GetTweets(ctx context.Context, in *pb.TweetRequest, out *pb.TweetResponse) error

	ShareTweet(ctx context.Context, req *pb.TweetReq) (*pb.MsgsRes, error)
	ViewTweet(ctx context.Context, req *pb.TweetReq) (*pb.MsgsRes, error)

	GetTweetLikeRecord(ctx context.Context, req *pb.MsgsKeyword) (*pb.TweetLikeRecordRes, error)
	GetTweetShareRecord(ctx context.Context, req *pb.MsgsKeyword) (*pb.TweetShareRecordRes, error)
	GetTweetViewRecord(ctx context.Context, req *pb.MsgsKeyword) (*pb.TweetViewRecordRes, error)

	GetTweetLikers(ctx context.Context, req *pb.MsgsKeyword) (*pb.TweetUserRefRes, error)
	GetTweetSharers(ctx context.Context, req *pb.MsgsKeyword) (*pb.TweetUserRefRes, error)
	GetTweetViewers(ctx context.Context, req *pb.MsgsKeyword) (*pb.TweetUserRefRes, error)
	GetTweetUserActionState(ctx context.Context, req *pb.MsgsKeyword) (*pb.TweetUserActionStateRes, error)

	GetUserRecordByUserId(ctx context.Context, req *pb.UserRecordReq) (*pb.UserRecordRes, error)
	GetUserRecordByTweetUserId(ctx context.Context, req *pb.UserRecordReq) (*pb.UserRecordRes, error)
}

type MySqlRepository struct {
	Database *gorm.DB
}

type UserInfo struct {
	userId string `gorm:"id"`
	name   string `gorm:"wechat_name"`
	avatar string `gorm:"wechat_avatar"`
}

// Notification
func (r *MySqlRepository) CreateNotification(ctx context.Context, item *pb.Notification) (*pb.MsgsKeyword, error) {
	item.Id = uuid.NewV4().String()
	item.CreateTime = int32(time.Now().Unix())

	if err := r.Database.Table("notification").Create(&item).Error; err != nil {
		return nil, err
	}

	pushNotification(item, r)

	return &pb.MsgsKeyword{Value: item.Id}, nil
}

func (r *MySqlRepository) UpdateNotification(ctx context.Context, in *pb.Notification, out *pb.NotificationsRes) error {
	if err := r.Database.Table("notification").Updates(&in).Error; err != nil {
		return err
	}
	if err := r.Database.Table("notification").First(&out.Data).Error; err != nil {
		return err
	}
	return nil
}

func (r *MySqlRepository) DeleteNotification(ctx context.Context, in *pb.DeleteNotificationRequest, out *pb.NotificationsRes) error {
	db := r.Database
	var data []*pb.Notification
	if err := db.Table("notification").Where("id IN ?", in.Values).Find(&data).Error; err != nil {
		return err
	}
	if err := db.Table("user_notification").Delete(&pb.UserNotification{}, "notification_id IN ?", in.Values).Error; err != nil {
		return err
	}
	if err := db.Table("notification").Delete(&pb.Notification{}, "id IN ?", in.Values).Error; err != nil {
		return err
	}
	out.Data = data
	return nil
}

func pushNotification(item *pb.Notification, r *MySqlRepository) error {

	users := make([]*aPB.Account, 0)
	if err := r.Database.Table("user").Find(&users).Error; err != nil {
		return err
	}

	for _, a := range users {

		un := pb.UserNotification{
			UserId:         a.Id,
			NotificationId: item.Id,
			Status:         0,
		}

		if err := r.Database.Table("user_notification").Create(&un).Error; err != nil {
			return err
		}

		notificationIncrement(un.UserId, r)
	}

	return nil
}

func notificationIncrement(user_id string, r *MySqlRepository) error {
	user := pb.UserUnreadMessage{}
	user.UserId = user_id

	if err := r.Database.Table("user_unread_message").First(&user).Error; err != nil {
		user.Conversation = 0
		user.Notification = 0

		if err := r.Database.Table("user_unread_message").Create(&user).Error; err != nil {
			return err
		}
	}

	user.Notification += 1
	if err := r.Database.Table("user_unread_message").Where("user_id = ?", user.UserId).Save(&user).Error; err != nil {
		return err
	}

	return nil
}

func (r *MySqlRepository) GetNotification(ctx context.Context, req *pb.MsgsKeyword) (*pb.Notification, error) {
	result := new(pb.Notification)
	result.Id = req.Value

	if err := r.Database.Table("notification").First(&result).Error; err != nil {
		return nil, err
	}

	return result, nil
}

func (r *MySqlRepository) GetNotifications(ctx context.Context, req *pb.MsgsEmptyReq) (*pb.NotificationsRes, error) {
	result := new(pb.NotificationsRes)
	result.Data = make([]*pb.Notification, 0)

	if err := r.Database.Table("notification").Find(&result.Data).Error; err != nil {
		return nil, err
	}

	return result, nil
}

// UserNotification
func (r *MySqlRepository) UpdateUserNotification(ctx context.Context, item *pb.UserNotification) (*pb.MsgsRes, error) {
	if err := r.Database.Table("user_notification").Where("user_id = ? AND notification_id = ?", item.UserId, item.NotificationId).Updates(pb.UserNotification{
		Status: item.Status,
	}).Error; err != nil {
		return nil, err
	}

	notificationDecrement(item.UserId, r)

	return &pb.MsgsRes{Value: true}, nil
}

func notificationDecrement(user_id string, r *MySqlRepository) error {
	user := pb.UserUnreadMessage{}
	user.UserId = user_id

	if err := r.Database.Table("user_unread_message").First(&user).Error; err != nil {
		return err
	}

	user.Notification -= 1
	if user.Notification < 0 {
		user.Notification = 0
	}
	if err := r.Database.Table("user_unread_message").Where("user_id = ?", user.UserId).Save(&user).Error; err != nil {
		return err
	}

	return nil
}

func (r *MySqlRepository) GetUserNotifications(ctx context.Context, req *pb.MsgsKeyword) (*pb.UserNotificationsRes, error) {
	result := new(pb.UserNotificationsRes)
	result.Data = make([]*pb.UserNotification, 0)

	if err := r.Database.Table("user_notification").Find(&result.Data).Error; err != nil {
		return nil, err
	}

	return result, nil
}

// UserUnreadMessage
func (r *MySqlRepository) GetUserUnreadMessage(ctx context.Context, req *pb.MsgsKeyword) (*pb.UserUnreadMessage, error) {
	userID := req.Value
	result := pb.UserUnreadMessage{UserId: userID}
	db := r.Database
	if err := db.Table("user_unread_message").Where("user_id = ?", userID).First(&result).Error; err != nil && err.Error() != ErrNoRecord {
		return nil, err
	}

	conversation := []struct {
		Participant  string
		MessageCount int
	}{}

	if err := db.Table("conversation").Select("participant, COUNT(1) AS message_count").Where("`to` = ? AND read_time = 0", userID).Group("participant").
		Find(&conversation).Error; err == nil {
		for _, v := range conversation {
			switch v.Participant {
			// System
			case "0":
				result.System += int32(v.MessageCount)
			// Customer Service
			case "1":
				result.CustomerService += int32(v.MessageCount)
			// Reward
			case "2":
				result.Reward += int32(v.MessageCount)
			// Badge
			default:
				result.Badge += int32(v.MessageCount)
			}
		}
	}

	return &result, nil
}

func (r *MySqlRepository) ClearUserUnreadMessage(ctx context.Context, req *pb.ClearUserUnreadMessageReq) (*pb.MsgsRes, error) {
	uum := pb.UserUnreadMessage{}

	if err := r.Database.Table("user_unread_message").Where("user_id = ?", req.UserId).First(&uum).Error; err != nil {
		return nil, err
	}

	switch req.Type {
	case "Notification":
		uum.Notification = 0
	case "Conversation":
		uum.Conversation = 0
	case "Followers":
		uum.Followers = 0
	case "Like":
		uum.Like = 0
	case "Share":
		uum.Share = 0
	case "View":
		uum.View = 0
	case "":
		uum.Like = 0
		uum.View = 0
		uum.Share = 0
		uum.Followers = 0
		uum.Conversation = 0
		uum.Notification = 0
	}

	if err := r.Database.Table("user_unread_message").Where("user_id = ?", uum.UserId).Save(&uum).Error; err != nil {
		return nil, err
	}

	return &pb.MsgsRes{Value: true}, nil
}

// Conversation
func (r *MySqlRepository) CreateConversation(ctx context.Context, item *pb.Conversation) (*pb.MsgsKeyword, error) {
	item.Id = uuid.NewV4().String()

	if err := r.Database.Table("conversation").Create(&item).Error; err != nil {
		return nil, err
	}

	updateUserUnreadMessage(r, item.To, "Conversation")
	updateUserUnreadMessage(r, item.To, "Notification")

	return &pb.MsgsKeyword{Value: item.Id}, nil
}

func (r *MySqlRepository) UpdateConversation(ctx context.Context, item *pb.Conversation) (*pb.MsgsRes, error) {
	if err := r.Database.Table("conversation").Where("id = ?", item.Id).Updates(pb.Conversation{
		ReadTime: item.ReadTime,
		Status:   item.Status,
	}).Error; err != nil {
		return nil, err
	}

	conversationDecrement(item.To, r)

	return &pb.MsgsRes{Value: true}, nil
}

func conversationDecrement(user_id string, r *MySqlRepository) error {
	user := pb.UserUnreadMessage{}
	user.UserId = user_id

	if err := r.Database.Table("user_unread_message").First(&user).Error; err != nil {
		return err
	}

	user.Conversation -= 1
	if user.Conversation < 0 {
		user.Conversation = 0
	}

	if err := r.Database.Table("user_unread_message").Where("user_id = ?", user.UserId).Save(&user).Error; err != nil {
		return err
	}

	return nil
}

func (r *MySqlRepository) GetConversation(ctx context.Context, req *pb.MsgsKeyword) (*pb.Conversation, error) {
	result := new(pb.Conversation)
	result.Id = req.Value
	if err := r.Database.Table("conversation").First(&result).Error; err != nil {
		return nil, err
	}

	return result, nil
}

func (r *MySqlRepository) GetParticipantConversations(ctx context.Context, in *pb.ParticipantConversationRequest, out *pb.ConversationsResponse) error {
	query := ""
	args := []interface{}{}
	switch in.Participant {
	case "0":
		query = "participant = ? AND `to` = ?"
		args = append(args, in.Participant, in.From)
	case "1":
		query = "participant = ? AND (`from` = ? OR `to` = ?)"
		args = append(args, in.Participant, in.From, in.From)
	case "2":
		query = "participant = ? AND `to` = ?"
		args = append(args, in.Participant, in.From)
	default:
		query = "participant = ? AND ((`from` = ? AND `to` = ?) OR (`from` = ? AND `to` = ?))"
		args = append(args, in.Participant, in.From, in.UserId, in.UserId, in.From)
	}

	if err := r.Database.Table("conversation").Where(query, args...).Order("send_time DESC").
		Find(&out.Data).Error; err != nil {
		return err
	}

	return nil
}

func (r *MySqlRepository) GetUserConversations(ctx context.Context, in *pb.UserConversationRequest, out *pb.UserConversationResponse) error {
	db := r.Database
	c := db.Table("conversation").
		Select(
			"id"+
				", participant"+
				", `from`"+
				", `to`"+
				", content"+
				", send_time"+
				", read_time"+
				", status"+
				", ROW_NUMBER() OVER (PARTITION BY participant, IF(`from` = ?, `to`, `from`) ORDER BY send_time DESC ) AS rn",
			in.UserId,
		).
		Where("(`from` <> '' AND `to` <> '' ) AND (`from` = ? OR `to` = ?)", in.UserId, in.UserId)

	if err := db.Table("(?) AS r", c).
		Select("r.id, r.participant, r.`from`, r.`to`, r.content, r.send_time, r.read_time, r.status").
		Where("r.rn = 1").
		Order("r.send_time DESC").
		Find(&out.Data).Error; err != nil {
		return err
	}

	return nil
}

func (r *MySqlRepository) GetServiceConversations(ctx context.Context, in *pb.UserConversationRequest, out *pb.UserConversationResponse) error {
	db := r.Database
	c := db.Table("conversation c").
		InnerJoins("INNER JOIN user u1 ON c.`from` = u1.id").
		Select("IF(u1.role = 'ROOT' OR u1.role = 'ADMIN', c.`to`, c.`from`) as contact").
		Where("participant = '1'")

	q := db.Table("(?) AS c", c).
		Select("(SELECT id FROM conversation WHERE participant = '1' AND (`from` = c.contact OR `to` = c.contact) ORDER BY send_time DESC LIMIT 1) AS id").
		Group("c.contact")

	if err := db.Table("conversation AS q1, (?) AS q2", q).
		Select("q1.id, q1.participant, q1.`from`, q1.`to`, q1.content, q1.send_time, q1.read_time, q1.status").
		Where("q1.id = q2.id").
		Order("q1.send_time DESC").
		Find(&out.Data).Error; err != nil {
		return err
	}

	return nil
}

func (r *MySqlRepository) ReadConversations(ctx context.Context, in *pb.ParticipantConversationRequest) error {
	if err := r.Database.Table("conversation").
		Where("participant = ? AND `to` = ? AND read_time = 0", in.Participant, in.UserId).
		Updates(pb.Conversation{ReadTime: int32(time.Now().Unix())}).Error; err != nil {
		return err
	}

	return nil
}

// Tweet
func (r *MySqlRepository) CreateTweet(ctx context.Context, item *pb.Tweet) (*pb.MsgsKeyword, error) {
	item.Id = uuid.NewV4().String()
	item.CreateTime = int32(time.Now().Unix())
	item.Status = 1

	if err := r.Database.Table("tweet").Create(&item).Error; err != nil {
		return nil, err
	}

	return &pb.MsgsKeyword{Value: item.Id}, nil
}

func (r *MySqlRepository) UpdateTweet(ctx context.Context, item *pb.Tweet) (*pb.MsgsRes, error) {
	if err := r.Database.Table("tweet").Where("id = ?", item.Id).Updates(pb.Tweet{
		LikeCount:  item.LikeCount,
		ShareCount: item.ShareCount,
		ViewCount:  item.ViewCount,
		Status:     item.Status,
		UpdatedAt:  int32(time.Now().Unix()),
	}).Error; err != nil {
		return nil, err
	}

	return &pb.MsgsRes{Value: true}, nil
}

func (r *MySqlRepository) RemoveTweet(ctx context.Context, in *pb.Tweet, out *pb.MsgsRes) error {
	if err := r.Database.Table("tweet").Where("status = 3").Delete(&in).Error; err != nil {
		return err
	}

	out = &pb.MsgsRes{Value: true}

	return nil
}

func (r *MySqlRepository) GetTweet(ctx context.Context, req *pb.MsgsKeyword) (*pb.Tweet, error) {
	result := new(pb.Tweet)
	result.Id = req.Value
	if err := r.Database.Table("tweet").First(&result).Error; err != nil {
		return nil, err
	}

	return result, nil
}

func (r *MySqlRepository) GetTweetByUserID(ctx context.Context, req *pb.MsgsKeyword) (*pb.TweetsRes, error) {
	result := new(pb.TweetsRes)
	result.Data = make([]*pb.Tweet, 0)

	if err := r.Database.Table("tweet").Where("user_id = ?", req.Value).Find(&result.Data).Error; err != nil {
		return nil, err
	}

	return result, nil
}

func (r *MySqlRepository) GetNewestTweet(ctx context.Context, req *pb.NewestTweetReq) (*pb.TweetsRes, error) {
	result := new(pb.TweetsRes)
	result.Data = make([]*pb.Tweet, 0)

	offset := (req.PageIndex - 1) * req.PageSize
	db := r.Database.Table("tweet").Where("status = 2 AND event_id = ?", req.EventId).Order("like_count desc, updated_at desc")

	db.Count(&result.Total)

	if err := db.Limit(int(req.PageSize)).Offset(int(offset)).Find(&result.Data).Error; err != nil {
		return nil, err
	}

	return result, nil
}

func (r *MySqlRepository) GetUserTweet(ctx context.Context, in *pb.UserTweetRequest, out *pb.TweetsRes) error {
	if err := r.Database.Table("tweet").
		Where(
			"user_id = ? AND event_id = ? AND sceneryspot_id = ?",
			in.UserId,
			in.EventId,
			in.SceneryspotId,
		).
		Order("create_time desc").Find(&out.Data).Error; err != nil {
		return err
	}
	return nil
}

func getUserInfo(r *MySqlRepository, userId string) (*UserInfo, error) {

	result := make(map[string]interface{})

	if err := r.Database.Raw("SELECT id as userId, wechat_name as name, wechat_avatar as avatar FROM user WHERE id = ?", userId).First(&result).Error; err != nil {
		return nil, err
	}

	user := new(UserInfo)
	user.name = result["name"].(string)
	user.userId = result["userId"].(string)
	user.avatar = result["avatar"].(string)

	return user, nil
}

func (r *MySqlRepository) LikeTweet(ctx context.Context, req *pb.TweetReq) (*pb.MsgsRes, error) {

	tuas := new(pb.TweetUserActionState)
	if err := r.Database.Table("tweet_user_action_state").Where("user_id = ? and tweet_id = ?", req.UserId, req.TweetId).First(&tuas).Error; err == nil {
		if tuas.Like != 0 {
			return &pb.MsgsRes{Value: false}, nil
		}
	}

	user, _ := getUserInfo(r, req.UserId)

	tweet := new(pb.Tweet)
	tweet.Id = req.TweetId
	if err := r.Database.Table("tweet").First(&tweet).Error; err != nil {
		return nil, err
	}

	tweet.LikeCount += 1
	r.Database.Table("tweet").Save(&tweet)

	updateUserUnreadMessage(r, tweet.UserId, "Like")
	updateTweetUserActionState(r, req.TweetId, req.UserId, "Like", tweet.EventId, tweet.UserId, tweet.SceneryspotId, user.name)

	addUserRecord(r, user.userId, req.TweetId, tweet.UserId, "Like")
	addUserLikeRecord(r, tweet.UserId, req.UserId, req.TweetId)
	addTweetLikeRecord(r, *user, req.TweetId)
	// addConversationBySystem(r, "点赞", user.name, tweet.UserId)

	return &pb.MsgsRes{Value: true}, nil
}

func addUserRecord(r *MySqlRepository, userId string, tweetId string, tweetUserId string, actionType string) error {
	item := new(pb.UserRecord)
	item.Id = uuid.NewV4().String()
	item.UserId = userId
	item.TweetId = tweetId
	item.TweetUserId = tweetUserId
	item.ActionType = actionType
	item.Time = int32(time.Now().Unix())

	if err := r.Database.Table("user_record").Create(&item).Error; err != nil {
		return err
	}

	return nil
}

func updateTweetUserActionState(r *MySqlRepository, tweetId string, userId string, actionType string, tweetEventId string, tweetOwner string, tweetSceneryspotId string, userName string) error {
	item := new(pb.TweetUserActionState)
	item.UserId = userId
	item.TweetId = tweetId

	if err := r.Database.Table("tweet_user_action_state").Where("user_id = ? and tweet_id = ?", item.UserId, item.TweetId).First(&item).Error; err != nil {
		item.Like = 0
		item.Share = 0
		item.View = 0
		if err := r.Database.Table("tweet_user_action_state").Create(&item).Error; err != nil {
			return err
		}
	}

	switch actionType {
	case "Like":
		item.Like = 1
	case "Unlike":
		item.Like = 0
	case "Share":
		item.Share = 1
	case "View":
		item.View = 1
	}

	if err := r.Database.Table("tweet_user_action_state").Where("user_id = ? and tweet_id = ?", item.UserId, item.TweetId).Save(&item).Error; err != nil {
		return err
	}

	return nil
}

func addTweetLikeRecord(r *MySqlRepository, user UserInfo, tweetId string) error {
	item := pb.TweetLikeRecord{}
	item.Id = uuid.NewV4().String()
	item.TweetId = tweetId
	item.LikeUserId = user.userId
	item.LikeUserName = user.name
	item.LikeUserAvatar = user.avatar
	item.LikeTime = int32(time.Now().Unix())

	if err := r.Database.Table("tweet_like_record").Create(&item).Error; err != nil {
		return err
	}

	return nil
}

func updateUserUnreadMessage(r *MySqlRepository, userId string, messageTpye string) error {

	uum := pb.UserUnreadMessage{}
	uum.UserId = userId

	if err := r.Database.Table("user_unread_message").Where("user_id = ?", uum.UserId).First(&uum).Error; err != nil {
		uum.Conversation = 0
		uum.Notification = 0
		uum.Followers = 0
		uum.Like = 0
		uum.Share = 0
		uum.Like = 0
		if err := r.Database.Table("user_unread_message").Create(&uum).Error; err != nil {
			return err
		}
	}

	switch messageTpye {
	case "Notification":
		uum.Notification += 1
	case "Conversation":
		uum.Conversation += 1
	case "Followers":
		uum.Followers += 1
	case "Like":
		uum.Like += 1
	case "Share":
		uum.Share += 1
	case "View":
		uum.View += 1
	}

	if err := r.Database.Table("user_unread_message").Where("user_id = ?", uum.UserId).Save(&uum).Error; err != nil {
		return err
	}

	return nil
}

func addUserLikeRecord(r *MySqlRepository, userId string, liker string, tweetId string) error {
	ulr := pb.UserLikeRecord{}
	ulr.Id = uuid.NewV4().String()
	ulr.LikeTime = int32(time.Now().Unix())
	ulr.UserId = userId
	ulr.Liker = liker
	ulr.LikeTweet = tweetId

	if err := r.Database.Table("user_like_record").Create(&ulr).Error; err != nil {
		return err
	}

	return nil
}

func addConversationBySystem(r *MySqlRepository, actionType string, userName string, tweetOwner string) error {

	item := pb.Conversation{}
	item.Id = uuid.NewV4().String()
	item.Participant = "0"
	item.From = ""
	item.To = tweetOwner
	item.Content = userName + " " + actionType + "了你的印迹"
	item.Status = 1
	item.SendTime = int32(time.Now().Unix())

	if err := r.Database.Table("conversation").Create(&item).Error; err != nil {
		return err
	}

	updateUserUnreadMessage(r, item.To, "Notification")

	return nil
}

func (r *MySqlRepository) UnlikeTweet(ctx context.Context, req *pb.TweetReq) (*pb.MsgsRes, error) {

	tweet := new(pb.Tweet)
	tweet.Id = req.TweetId
	if err := r.Database.Table("tweet").First(&tweet).Error; err != nil {
		return nil, err
	}

	tweet.LikeCount -= 1
	if tweet.LikeCount < 0 {
		tweet.LikeCount = 0
	}

	r.Database.Table("tweet").Save(&tweet)
	updateTweetUserActionState(r, req.TweetId, req.UserId, "Unlike", tweet.EventId, tweet.UserId, tweet.SceneryspotId, "")

	return &pb.MsgsRes{Value: true}, nil
}

func (r *MySqlRepository) GetUserLikesRecord(ctx context.Context, req *pb.MsgsKeyword) (*pb.UserLikeRecordsRes, error) {

	result := new(pb.UserLikeRecordsRes)
	result.Data = make([]*pb.UserLikeRecord, 0)

	if err := r.Database.Table("user_like_record").Where("liker = ?", req.Value).Order("like_time desc").Find(&result.Data).Error; err != nil {
		return nil, err
	}

	return result, nil
}

func (r *MySqlRepository) GetUserLikedRecord(ctx context.Context, req *pb.MsgsKeyword) (*pb.UserLikeRecordsRes, error) {

	result := new(pb.UserLikeRecordsRes)
	result.Data = make([]*pb.UserLikeRecord, 0)

	if err := r.Database.Table("user_like_record").Where("user_id = ?", req.Value).Order("like_time desc").Find(&result.Data).Error; err != nil {
		return nil, err
	}

	return result, nil
}

func (r *MySqlRepository) ShareTweet(ctx context.Context, req *pb.TweetReq) (*pb.MsgsRes, error) {

	user, _ := getUserInfo(r, req.UserId)

	tweet := new(pb.Tweet)
	tweet.Id = req.TweetId
	if err := r.Database.Table("tweet").First(&tweet).Error; err != nil {
		return nil, err
	}

	tweet.ShareCount += 1
	r.Database.Table("tweet").Save(&tweet)

	// updateUserUnreadMessage(r, tweet.UserId, "Share")
	updateTweetUserActionState(r, req.TweetId, req.UserId, "Share", tweet.EventId, tweet.UserId, tweet.SceneryspotId, user.name)

	addUserRecord(r, user.userId, req.TweetId, tweet.UserId, "Share")
	addTweetShareRecord(r, *user, req.TweetId)
	// addConversationBySystem(r, "分享", user.name, tweet.UserId)

	return &pb.MsgsRes{Value: true}, nil
}

func addTweetShareRecord(r *MySqlRepository, user UserInfo, tweetId string) error {
	item := pb.TweetShareRecord{}
	item.Id = uuid.NewV4().String()
	item.TweetId = tweetId
	item.ShareUserId = user.userId
	item.ShareUserName = user.name
	item.ShareUserAvatar = user.avatar
	item.ShareTime = int32(time.Now().Unix())

	if err := r.Database.Table("tweet_share_record").Create(&item).Error; err != nil {
		return err
	}

	return nil
}

func (r *MySqlRepository) ViewTweet(ctx context.Context, req *pb.TweetReq) (*pb.MsgsRes, error) {
	user, _ := getUserInfo(r, req.UserId)

	tweet := new(pb.Tweet)
	tweet.Id = req.TweetId
	if err := r.Database.Table("tweet").First(&tweet).Error; err != nil {
		return nil, err
	}

	tweet.ViewCount += 1
	r.Database.Table("tweet").Save(&tweet)

	// updateUserUnreadMessage(r, tweet.UserId, "View")
	updateTweetUserActionState(r, req.TweetId, req.UserId, "View", tweet.EventId, tweet.UserId, tweet.SceneryspotId, user.name)

	addUserRecord(r, user.userId, req.TweetId, tweet.UserId, "View")
	addTweetViewRecord(r, *user, req.TweetId)
	// addConversationBySystem(r, "查看", user.name, tweet.UserId)

	return &pb.MsgsRes{Value: true}, nil
}

func addTweetViewRecord(r *MySqlRepository, user UserInfo, tweetId string) error {
	item := pb.TweetViewRecord{}
	item.Id = uuid.NewV4().String()
	item.TweetId = tweetId
	item.ViewUserId = user.userId
	item.ViewUserName = user.name
	item.ViewUserAvatar = user.avatar
	item.ViewTime = int32(time.Now().Unix())

	if err := r.Database.Table("tweet_view_record").Create(&item).Error; err != nil {
		return err
	}

	return nil
}

func (r *MySqlRepository) GetTweetLikeRecord(ctx context.Context, req *pb.MsgsKeyword) (*pb.TweetLikeRecordRes, error) {

	result := new(pb.TweetLikeRecordRes)
	result.Data = make([]*pb.TweetLikeRecord, 0)

	if err := r.Database.Table("tweet_like_record").Where("tweet_id = ?", req.Value).Order("like_time desc").Find(&result.Data).Error; err != nil {
		return nil, err
	}

	return result, nil
}

func (r *MySqlRepository) GetTweetShareRecord(ctx context.Context, req *pb.MsgsKeyword) (*pb.TweetShareRecordRes, error) {

	result := new(pb.TweetShareRecordRes)
	result.Data = make([]*pb.TweetShareRecord, 0)

	if err := r.Database.Table("tweet_share_record").Where("tweet_id = ?", req.Value).Order("share_time desc").Find(&result.Data).Error; err != nil {
		return nil, err
	}

	return result, nil
}

func (r *MySqlRepository) GetTweetViewRecord(ctx context.Context, req *pb.MsgsKeyword) (*pb.TweetViewRecordRes, error) {

	result := new(pb.TweetViewRecordRes)
	result.Data = make([]*pb.TweetViewRecord, 0)

	if err := r.Database.Table("tweet_view_record").Where("tweet_id = ?", req.Value).Order("view_time desc").Find(&result.Data).Error; err != nil {
		return nil, err
	}

	return result, nil
}

func (r *MySqlRepository) GetTweetLikers(ctx context.Context, req *pb.MsgsKeyword) (*pb.TweetUserRefRes, error) {

	result := new(pb.TweetUserRefRes)
	result.Data = make([]*pb.TweetUserRef, 0)

	if err := r.Database.Table("tweet_user_action_state").Select("tweet_id", "user_id").Where("tweet_id = ? and `like` = 1", req.Value).Find(&result.Data).Error; err != nil {
		return nil, err
	}

	return result, nil
}

func (r *MySqlRepository) GetTweetSharers(ctx context.Context, req *pb.MsgsKeyword) (*pb.TweetUserRefRes, error) {

	result := new(pb.TweetUserRefRes)
	result.Data = make([]*pb.TweetUserRef, 0)

	if err := r.Database.Table("tweet_user_action_state").Select("tweet_id", "user_id").Where("tweet_id = ? and `share` = 1", req.Value).Find(&result.Data).Error; err != nil {
		return nil, err
	}

	return result, nil
}

func (r *MySqlRepository) GetTweetViewers(ctx context.Context, req *pb.MsgsKeyword) (*pb.TweetUserRefRes, error) {

	result := new(pb.TweetUserRefRes)
	result.Data = make([]*pb.TweetUserRef, 0)

	if err := r.Database.Table("tweet_user_action_state").Select("tweet_id", "user_id").Where("tweet_id = ? and `view` = 1", req.Value).Find(&result.Data).Error; err != nil {
		return nil, err
	}

	return result, nil
}

func (r *MySqlRepository) GetTweetUserActionState(ctx context.Context, req *pb.MsgsKeyword) (*pb.TweetUserActionStateRes, error) {

	result := new(pb.TweetUserActionStateRes)
	result.Data = make([]*pb.TweetUserActionState, 0)

	if err := r.Database.Table("tweet_user_action_state").Where("tweet_id = ?", req.Value).Find(&result.Data).Error; err != nil {
		return nil, err
	}

	return result, nil
}

func (r *MySqlRepository) GetUserRecordByUserId(ctx context.Context, req *pb.UserRecordReq) (*pb.UserRecordRes, error) {

	result := new(pb.UserRecordRes)
	result.Data = make([]*pb.UserRecord, 0)

	if err := r.Database.Table("user_record").Where("user_id = ? AND action_type = ?", req.UserId, req.ActionType).Find(&result.Data).Order("time DESC").Error; err != nil {
		return nil, err
	}

	return result, nil
}

func (r *MySqlRepository) GetUserRecordByTweetUserId(ctx context.Context, req *pb.UserRecordReq) (*pb.UserRecordRes, error) {

	result := new(pb.UserRecordRes)
	result.Data = make([]*pb.UserRecord, 0)

	if err := r.Database.Table("user_record").Where("tweet_user_id = ? AND action_type = ?", req.UserId, req.ActionType).Find(&result.Data).Order("time DESC").Error; err != nil {
		return nil, err
	}

	return result, nil
}

// Followers
func (r *MySqlRepository) CreateFollowers(ctx context.Context, item *pb.Followers) (*pb.MsgsRes, error) {

	item.FollowerTime = int32(time.Now().Unix())
	if err := r.Database.Table("followers").Create(&item).Error; err != nil {
		return nil, err
	}

	uum := pb.UserUnreadMessage{}
	uum.UserId = item.UserId

	if err := r.Database.Table("user_unread_message").First(&uum).Error; err != nil {
		if err := r.Database.Table("user_unread_message").Create(&uum).Error; err != nil {
			return nil, err
		}
	}

	uum.Followers += 1
	if err := r.Database.Table("user_unread_message").Where("user_id = ?", uum.UserId).Save(&uum).Error; err != nil {
		return nil, err
	}

	return &pb.MsgsRes{Value: true}, nil
}

func (r *MySqlRepository) RemoveFollowers(ctx context.Context, item *pb.Followers) (*pb.MsgsRes, error) {
	if err := r.Database.Table("followers").Where("user_id = ? AND follower = ?", item.UserId, item.Follower).Delete(&pb.Followers{}).Error; err != nil {
		return nil, err
	}

	return &pb.MsgsRes{Value: true}, nil
}

func (r *MySqlRepository) GetFollowersByUserID(ctx context.Context, req *pb.MsgsKeyword) (*pb.FollowerssRes, error) {
	result := new(pb.FollowerssRes)
	result.Data = make([]*pb.Followers, 0)

	if err := r.Database.Table("followers").Where("user_id = ?", req.Value).Find(&result.Data).Error; err != nil {
		return nil, err
	}

	return result, nil
}

// Following
func (r *MySqlRepository) CreateFollowing(ctx context.Context, item *pb.Following) (*pb.MsgsRes, error) {

	item.FollowingTime = int32(time.Now().Unix())
	if err := r.Database.Table("following").Create(&item).Error; err != nil {
		return nil, err
	}

	return &pb.MsgsRes{Value: true}, nil
}

func (r *MySqlRepository) RemoveFollowing(ctx context.Context, item *pb.Following) (*pb.MsgsRes, error) {

	if err := r.Database.Table("following").Where("user_id = ? AND following = ?", item.UserId, item.Following).Delete(&pb.Following{}).Error; err != nil {
		return nil, err
	}

	return &pb.MsgsRes{Value: true}, nil
}

func (r *MySqlRepository) GetFollowingByUserID(ctx context.Context, req *pb.MsgsKeyword) (*pb.FollowingsRes, error) {
	result := new(pb.FollowingsRes)
	result.Data = make([]*pb.Following, 0)

	if err := r.Database.Table("following").Where("user_id = ?", req.Value).Find(&result.Data).Error; err != nil {
		return nil, err
	}

	return result, nil
}

func (r *MySqlRepository) GetTweets(ctx context.Context, in *pb.TweetRequest, out *pb.TweetResponse) error {
	db := r.Database.Table("tweet")
	if in.Status > 0 {
		db = db.Where("status = ?", in.Status)
	}
	if len(in.UserId) > 0 {
		db = db.Where("user_id = ?", in.UserId)
	}
	if len(in.EventId) > 0 {
		db = db.Where("event_id = ?", in.EventId)
	}
	if len(in.Sceneryspots) > 0 {
		db = db.Where("sceneryspot_id IN ?", in.Sceneryspots)
	}
	if in.Status == 2 || in.Status == 3 {
		db = db.Order("updated_at DESC")
	} else {
		db = db.Order("create_time")
	}
	if in.Offset > 0 {
		db = db.Offset(int(in.Offset))
	}
	if in.Limit > 0 {
		db = db.Limit(int(in.Limit))
	}

	if err := db.Find(&out.Data).Error; err != nil {
		return err
	}

	return nil
}
