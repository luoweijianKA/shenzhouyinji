package repository

import (
	"context"
	"time"

	uuid "github.com/satori/go.uuid"
	pb "gitlab.com/annoying-orange/shenzhouyinji/service/task/proto"
	"gorm.io/gorm"
)

const StatusDelete = 4

type Repository interface {
	CreateTrek(ctx context.Context, item *pb.Trek) (*pb.TsKeyword, error)
	UpdateTrek(ctx context.Context, item *pb.Trek) (*pb.TsRes, error)
	GetTrek(ctx context.Context, req *pb.TsKeyword) (*pb.Trek, error)
	GetTrekBySceneryspotID(ctx context.Context, req *pb.TsKeyword) (*pb.TreksRes, error)
	GetTreks(ctx context.Context, in *pb.TaskRequest, out *pb.TreksRes) error

	CreateGeocaching(ctx context.Context, item *pb.Geocaching) (*pb.TsKeyword, error)
	UpdateGeocaching(ctx context.Context, item *pb.Geocaching) (*pb.TsRes, error)
	GetGeocaching(ctx context.Context, req *pb.TsKeyword) (*pb.Geocaching, error)
	GetGeocachingBySceneryspotID(ctx context.Context, req *pb.TsKeyword) (*pb.GeocachingsRes, error)
	GetGeocachings(ctx context.Context, in *pb.TaskRequest, out *pb.GeocachingsRes) error

	CreateScreenshot(ctx context.Context, item *pb.Screenshot) (*pb.TsKeyword, error)
	UpdateScreenshot(ctx context.Context, item *pb.Screenshot) (*pb.TsRes, error)
	GetScreenshot(ctx context.Context, req *pb.TsKeyword) (*pb.Screenshot, error)
	GetScreenshotBySceneryspotID(ctx context.Context, req *pb.TsKeyword) (*pb.ScreenshotsRes, error)
	GetScreenshots(ctx context.Context, in *pb.TaskRequest, out *pb.ScreenshotsRes) error

	CreatePuzzle(ctx context.Context, item *pb.Puzzle) (*pb.TsKeyword, error)
	UpdatePuzzle(ctx context.Context, item *pb.Puzzle) (*pb.TsRes, error)
	GetPuzzle(ctx context.Context, req *pb.TsKeyword) (*pb.Puzzle, error)
	GetPuzzleBySceneryspotID(ctx context.Context, req *pb.TsKeyword) (*pb.PuzzlesRes, error)
	GetPuzzles(ctx context.Context, in *pb.TaskRequest, out *pb.PuzzlesRes) error

	CreateQuestionBank(ctx context.Context, item *pb.QuestionBank) (*pb.TsKeyword, error)
	UpdateQuestionBank(ctx context.Context, item *pb.QuestionBank) (*pb.TsRes, error)
	GetQuestionBank(ctx context.Context, req *pb.TsKeyword) (*pb.QuestionBank, error)
	GetQuestionBankBySceneryspotID(ctx context.Context, req *pb.TsKeyword) (*pb.QuestionBanksRes, error)
	GetQuestions(ctx context.Context, in *pb.TaskRequest, out *pb.QuestionBanksRes) error

	CreateQuestion(ctx context.Context, item *pb.Question) (*pb.TsKeyword, error)
	UpdateQuestion(ctx context.Context, item *pb.Question) (*pb.TsRes, error)
	GetQuestion(ctx context.Context, req *pb.TsKeyword) (*pb.Question, error)
	GetQuestionBySceneryspotID(ctx context.Context, req *pb.TsKeyword) (*pb.QuestionsRes, error)

	CreateUserTask(ctx context.Context, in *pb.UserTask, out *pb.UserTasksResponse) error
	UpdateUserTask(ctx context.Context, item *pb.UserTask) (*pb.TsRes, error)
	DeleteUserTask(ctx context.Context, in *pb.UserTask, out *pb.UserTasksResponse) error
	GetUserTask(ctx context.Context, req *pb.TsKeyword) (*pb.UserTask, error)
	GetUserTaskByUserID(ctx context.Context, req *pb.TsKeyword) (*pb.UserTasksRes, error)
	GetUserTaskByTaskID(ctx context.Context, req *pb.TsKeyword) (*pb.UserTasksRes, error)

	GetUserTasks(ctx context.Context, in *pb.UserTaskRequest, out *pb.UserTasksResponse) error
}

type MySqlRepository struct {
	Database *gorm.DB
}

// Trek
func (r *MySqlRepository) CreateTrek(ctx context.Context, item *pb.Trek) (*pb.TsKeyword, error) {
	item.Id = uuid.NewV4().String()
	item.CreateTime = int32(time.Now().Unix())

	if err := r.Database.Table("trek_task").Create(&item).Error; err != nil {
		return nil, err
	}

	return &pb.TsKeyword{Value: item.Id}, nil
}

func (r *MySqlRepository) UpdateTrek(ctx context.Context, item *pb.Trek) (*pb.TsRes, error) {
	if item.Status == StatusDelete {
		if err := r.Database.Table("trek_task").Delete(&pb.Trek{}, "id = ?", item.Id).Error; err != nil {
			return nil, err
		}
		if err := r.DeleteUserTask(ctx, &pb.UserTask{TaskId: item.Id}, &pb.UserTasksResponse{}); err != nil {
			return nil, err
		}

		return &pb.TsRes{Value: true}, nil
	}

	values := map[string]interface{}{
		"name":           item.Name,
		"step":           item.Step,
		"points":         item.Points,
		"images":         item.Images,
		"introduction":   item.Introduction,
		"start_time":     item.StartTime,
		"end_time":       item.EndTime,
		"necessary":      item.Necessary,
		"status":         item.Status,
		"electric_fence": item.ElectricFence,
	}

	if err := r.Database.Table("trek_task").Where("id = ?", item.Id).Updates(values).Error; err != nil {
		return nil, err
	}

	return &pb.TsRes{Value: true}, nil
}

func (r *MySqlRepository) GetTrek(ctx context.Context, req *pb.TsKeyword) (*pb.Trek, error) {
	result := new(pb.Trek)
	result.Id = req.Value
	if err := r.Database.Table("trek_task").First(&result).Error; err != nil {
		return nil, err
	}

	return result, nil
}

func (r *MySqlRepository) GetTrekBySceneryspotID(ctx context.Context, req *pb.TsKeyword) (*pb.TreksRes, error) {
	result := new(pb.TreksRes)
	result.Data = make([]*pb.Trek, 0)

	if err := r.Database.Table("trek_task").
		Where("sceneryspot_id = ? AND start_time = 0 AND end_time = 0", req.Value).
		Find(&result.Data).Error; err != nil {
		return nil, err
	}

	return result, nil
}

func (r *MySqlRepository) GetTreks(ctx context.Context, in *pb.TaskRequest, out *pb.TreksRes) error {
	db := r.Database.Table("trek_task").Where("necessary = ?", in.Necessary)
	if len(in.EventId) > 0 {
		db = db.Where("event_id = ?", in.EventId)
	}
	if len(in.Sceneryspots) == 1 {
		db = db.Where("sceneryspot_id = ?", in.Sceneryspots[0])
	}
	if len(in.Sceneryspots) > 1 {
		db = db.Where("sceneryspot_id IN ?", in.Sceneryspots)
	}
	if in.Status == 1 {
		db = db.Where("? BETWEEN start_time AND end_time", time.Now().Unix())
	}

	if err := db.Order("create_time DESC").Find(&out.Data).Error; err != nil {
		return err
	}
	return nil
}

// Geocaching
func (r *MySqlRepository) CreateGeocaching(ctx context.Context, item *pb.Geocaching) (*pb.TsKeyword, error) {
	item.Id = uuid.NewV4().String()
	item.CreateTime = int32(time.Now().Unix())

	if err := r.Database.Table("geocaching_task").Create(&item).Error; err != nil {
		return nil, err
	}

	return &pb.TsKeyword{Value: item.Id}, nil
}

func (r *MySqlRepository) UpdateGeocaching(ctx context.Context, item *pb.Geocaching) (*pb.TsRes, error) {
	if item.Status == StatusDelete {
		if err := r.Database.Table("geocaching_task").Delete(&pb.Geocaching{}, "id = ?", item.Id).Error; err != nil {
			return nil, err
		}
		if err := r.DeleteUserTask(ctx, &pb.UserTask{TaskId: item.Id}, &pb.UserTasksResponse{}); err != nil {
			return nil, err
		}

		return &pb.TsRes{Value: true}, nil
	}

	values := map[string]interface{}{
		"name":           item.Name,
		"points":         item.Points,
		"images":         item.Images,
		"introduction":   item.Introduction,
		"start_time":     item.StartTime,
		"end_time":       item.EndTime,
		"necessary":      item.Necessary,
		"status":         item.Status,
		"electric_fence": item.ElectricFence,
	}

	if err := r.Database.Table("geocaching_task").Where("id = ?", item.Id).Updates(values).Error; err != nil {
		return nil, err
	}

	return &pb.TsRes{Value: true}, nil
}

func (r *MySqlRepository) GetGeocaching(ctx context.Context, req *pb.TsKeyword) (*pb.Geocaching, error) {
	result := new(pb.Geocaching)
	result.Id = req.Value
	if err := r.Database.Table("geocaching_task").First(&result).Error; err != nil {
		return nil, err
	}

	return result, nil
}

func (r *MySqlRepository) GetGeocachingBySceneryspotID(ctx context.Context, req *pb.TsKeyword) (*pb.GeocachingsRes, error) {
	result := new(pb.GeocachingsRes)
	result.Data = make([]*pb.Geocaching, 0)

	if err := r.Database.Table("geocaching_task").
		Where("sceneryspot_id = ? AND start_time = 0 AND end_time = 0", req.Value).
		Find(&result.Data).Error; err != nil {
		return nil, err
	}

	return result, nil
}

func (r *MySqlRepository) GetGeocachings(ctx context.Context, in *pb.TaskRequest, out *pb.GeocachingsRes) error {
	db := r.Database.Table("geocaching_task").Where("necessary = ?", in.Necessary)
	if len(in.EventId) > 0 {
		db = db.Where("event_id = ?", in.EventId)
	}
	if len(in.Sceneryspots) == 1 {
		db = db.Where("sceneryspot_id = ?", in.Sceneryspots[0])
	}
	if len(in.Sceneryspots) > 1 {
		db = db.Where("sceneryspot_id IN ?", in.Sceneryspots)
	}
	if in.Status == 1 {
		db = db.Where("? BETWEEN start_time AND end_time", time.Now().Unix())
	}

	if err := db.Order("create_time DESC").Find(&out.Data).Error; err != nil {
		return err
	}
	return nil
}

// Screenshot
func (r *MySqlRepository) CreateScreenshot(ctx context.Context, item *pb.Screenshot) (*pb.TsKeyword, error) {
	item.Id = uuid.NewV4().String()
	item.CreateTime = int32(time.Now().Unix())

	if err := r.Database.Table("screenshot_task").Create(&item).Error; err != nil {
		return nil, err
	}

	return &pb.TsKeyword{Value: item.Id}, nil
}

func (r *MySqlRepository) UpdateScreenshot(ctx context.Context, item *pb.Screenshot) (*pb.TsRes, error) {
	if item.Status == StatusDelete {
		if err := r.Database.Table("screenshot_task").Delete(&pb.Screenshot{}, "id = ?", item.Id).Error; err != nil {
			return nil, err
		}
		if err := r.DeleteUserTask(ctx, &pb.UserTask{TaskId: item.Id}, &pb.UserTasksResponse{}); err != nil {
			return nil, err
		}

		return &pb.TsRes{Value: true}, nil
	}

	values := map[string]interface{}{
		"name":           item.Name,
		"points":         item.Points,
		"images":         item.Images,
		"introduction":   item.Introduction,
		"start_time":     item.StartTime,
		"end_time":       item.EndTime,
		"necessary":      item.Necessary,
		"status":         item.Status,
		"electric_fence": item.ElectricFence,
	}

	if err := r.Database.Table("screenshot_task").Where("id = ?", item.Id).Updates(values).Error; err != nil {
		return nil, err
	}

	return &pb.TsRes{Value: true}, nil
}

func (r *MySqlRepository) GetScreenshot(ctx context.Context, req *pb.TsKeyword) (*pb.Screenshot, error) {
	result := new(pb.Screenshot)
	result.Id = req.Value
	if err := r.Database.Table("screenshot_task").First(&result).Error; err != nil {
		return nil, err
	}

	return result, nil
}

func (r *MySqlRepository) GetScreenshotBySceneryspotID(ctx context.Context, req *pb.TsKeyword) (*pb.ScreenshotsRes, error) {
	result := new(pb.ScreenshotsRes)
	result.Data = make([]*pb.Screenshot, 0)

	if err := r.Database.Table("screenshot_task").
		Where("sceneryspot_id = ? AND start_time = 0 AND end_time = 0", req.Value).
		Find(&result.Data).Error; err != nil {
		return nil, err
	}

	return result, nil
}

func (r *MySqlRepository) GetScreenshots(ctx context.Context, in *pb.TaskRequest, out *pb.ScreenshotsRes) error {
	db := r.Database.Table("screenshot_task").Where("necessary = ?", in.Necessary)
	if len(in.EventId) > 0 {
		db = db.Where("event_id = ?", in.EventId)
	}
	if len(in.Sceneryspots) == 1 {
		db = db.Where("sceneryspot_id = ?", in.Sceneryspots[0])
	}
	if len(in.Sceneryspots) > 1 {
		db = db.Where("sceneryspot_id IN ?", in.Sceneryspots)
	}
	if in.Status == 1 {
		db = db.Where("? BETWEEN start_time AND end_time", time.Now().Unix())
	}

	if err := db.Order("create_time DESC").Find(&out.Data).Error; err != nil {
		return err
	}
	return nil
}

// Puzzle
func (r *MySqlRepository) CreatePuzzle(ctx context.Context, item *pb.Puzzle) (*pb.TsKeyword, error) {
	item.Id = uuid.NewV4().String()
	item.CreateTime = int32(time.Now().Unix())

	if err := r.Database.Table("puzzle_task").Create(&item).Error; err != nil {
		return nil, err
	}

	return &pb.TsKeyword{Value: item.Id}, nil
}

func (r *MySqlRepository) UpdatePuzzle(ctx context.Context, item *pb.Puzzle) (*pb.TsRes, error) {
	if item.Status == StatusDelete {
		if err := r.Database.Table("puzzle_task").Delete(&pb.Puzzle{}, "id = ?", item.Id).Error; err != nil {
			return nil, err
		}
		if err := r.DeleteUserTask(ctx, &pb.UserTask{TaskId: item.Id}, &pb.UserTasksResponse{}); err != nil {
			return nil, err
		}

		return &pb.TsRes{Value: true}, nil
	}

	values := map[string]interface{}{
		"name":           item.Name,
		"countdown":      item.Countdown,
		"points":         item.Points,
		"images":         item.Images,
		"introduction":   item.Introduction,
		"start_time":     item.StartTime,
		"end_time":       item.EndTime,
		"necessary":      item.Necessary,
		"status":         item.Status,
		"electric_fence": item.ElectricFence,
	}

	if err := r.Database.Table("puzzle_task").Where("id = ?", item.Id).Updates(values).Error; err != nil {
		return nil, err
	}

	return &pb.TsRes{Value: true}, nil
}

func (r *MySqlRepository) GetPuzzle(ctx context.Context, req *pb.TsKeyword) (*pb.Puzzle, error) {
	result := new(pb.Puzzle)
	result.Id = req.Value
	if err := r.Database.Table("puzzle_task").First(&result).Error; err != nil {
		return nil, err
	}

	return result, nil
}

func (r *MySqlRepository) GetPuzzleBySceneryspotID(ctx context.Context, req *pb.TsKeyword) (*pb.PuzzlesRes, error) {
	result := new(pb.PuzzlesRes)
	result.Data = make([]*pb.Puzzle, 0)

	if err := r.Database.Table("puzzle_task").
		Where("sceneryspot_id = ? AND start_time = 0 AND end_time = 0", req.Value).
		Find(&result.Data).Error; err != nil {
		return nil, err
	}

	return result, nil
}

func (r *MySqlRepository) GetPuzzles(ctx context.Context, in *pb.TaskRequest, out *pb.PuzzlesRes) error {
	db := r.Database.Table("puzzle_task").Where("necessary = ?", in.Necessary)
	if len(in.EventId) > 0 {
		db = db.Where("event_id = ?", in.EventId)
	}
	if len(in.Sceneryspots) == 1 {
		db = db.Where("sceneryspot_id = ?", in.Sceneryspots[0])
	}
	if len(in.Sceneryspots) > 1 {
		db = db.Where("sceneryspot_id IN ?", in.Sceneryspots)
	}
	if in.Status == 1 {
		db = db.Where("? BETWEEN start_time AND end_time", time.Now().Unix())
	}

	if err := db.Order("create_time DESC").Find(&out.Data).Error; err != nil {
		return err
	}
	return nil
}

// QuestionBank
func (r *MySqlRepository) CreateQuestionBank(ctx context.Context, item *pb.QuestionBank) (*pb.TsKeyword, error) {
	item.Id = uuid.NewV4().String()
	item.CreateTime = int32(time.Now().Unix())

	if err := r.Database.Table("question_bank").Create(&item).Error; err != nil {
		return nil, err
	}

	return &pb.TsKeyword{Value: item.Id}, nil
}

func (r *MySqlRepository) UpdateQuestionBank(ctx context.Context, item *pb.QuestionBank) (*pb.TsRes, error) {
	if item.Status == StatusDelete {
		if err := r.Database.Table("question_bank").Delete(&pb.QuestionBank{}, "id = ?", item.Id).Error; err != nil {
			return nil, err
		}
		if err := r.DeleteUserTask(ctx, &pb.UserTask{TaskId: item.Id}, &pb.UserTasksResponse{}); err != nil {
			return nil, err
		}

		return &pb.TsRes{Value: true}, nil
	}

	values := map[string]interface{}{
		"question":       item.Question,
		"options":        item.Options,
		"answer":         item.Answer,
		"start_time":     item.StartTime,
		"end_time":       item.EndTime,
		"necessary":      item.Necessary,
		"points":         item.Points,
		"status":         item.Status,
		"electric_fence": item.ElectricFence,
	}

	if err := r.Database.Table("question_bank").Where("id = ?", item.Id).Updates(values).Error; err != nil {
		return nil, err
	}

	return &pb.TsRes{Value: true}, nil
}

func (r *MySqlRepository) GetQuestionBank(ctx context.Context, req *pb.TsKeyword) (*pb.QuestionBank, error) {
	result := new(pb.QuestionBank)
	result.Id = req.Value
	if err := r.Database.Table("question_bank").First(&result).Error; err != nil {
		return nil, err
	}

	return result, nil
}

func (r *MySqlRepository) GetQuestionBankBySceneryspotID(ctx context.Context, req *pb.TsKeyword) (*pb.QuestionBanksRes, error) {
	result := new(pb.QuestionBanksRes)
	result.Data = make([]*pb.QuestionBank, 0)

	if err := r.Database.Table("question_bank").
		Where("sceneryspot_id = ? AND start_time = 0 AND end_time = 0", req.Value).
		Find(&result.Data).Error; err != nil {
		return nil, err
	}

	return result, nil
}

func (r *MySqlRepository) GetQuestions(ctx context.Context, in *pb.TaskRequest, out *pb.QuestionBanksRes) error {
	db := r.Database.Table("question_bank").Where("necessary = ?", in.Necessary)
	if len(in.EventId) > 0 {
		db = db.Where("event_id = ?", in.EventId)
	}
	if len(in.Sceneryspots) == 1 {
		db = db.Where("sceneryspot_id = ?", in.Sceneryspots[0])
	}
	if len(in.Sceneryspots) > 1 {
		db = db.Where("sceneryspot_id IN ?", in.Sceneryspots)
	}
	if in.Status == 1 {
		db = db.Where("? BETWEEN start_time AND end_time", time.Now().Unix())
	}

	if err := db.Order("create_time DESC").Find(&out.Data).Error; err != nil {
		return err
	}
	return nil
}

// Question
func (r *MySqlRepository) CreateQuestion(ctx context.Context, item *pb.Question) (*pb.TsKeyword, error) {
	item.Id = uuid.NewV4().String()
	item.CreateTime = int32(time.Now().Unix())

	if err := r.Database.Table("question_task").Create(&item).Error; err != nil {
		return nil, err
	}

	return &pb.TsKeyword{Value: item.Id}, nil
}

func (r *MySqlRepository) UpdateQuestion(ctx context.Context, item *pb.Question) (*pb.TsRes, error) {
	if err := r.Database.Table("question_task").Where("id = ?", item.Id).Updates(pb.Question{
		Questions: item.Questions,
		StartTime: item.StartTime,
		EndTime:   item.EndTime,
		Points:    item.Points,
		Status:    item.Status,
	}).Error; err != nil {
		return nil, err
	}

	return &pb.TsRes{Value: true}, nil
}

func (r *MySqlRepository) GetQuestion(ctx context.Context, req *pb.TsKeyword) (*pb.Question, error) {
	result := new(pb.Question)
	result.Id = req.Value
	if err := r.Database.Table("question_task").First(&result).Error; err != nil {
		return nil, err
	}

	return result, nil
}

func (r *MySqlRepository) GetQuestionBySceneryspotID(ctx context.Context, req *pb.TsKeyword) (*pb.QuestionsRes, error) {
	result := new(pb.QuestionsRes)
	result.Data = make([]*pb.Question, 0)

	if err := r.Database.Table("question_task").Where("sceneryspot_id = ?", req.Value).Find(&result.Data).Error; err != nil {
		return nil, err
	}

	return result, nil
}

// UserTask
func (r *MySqlRepository) CreateUserTask(ctx context.Context, in *pb.UserTask, out *pb.UserTasksResponse) error {
	in.Id = uuid.NewV4().String()
	in.CreateTime = int32(time.Now().Unix())

	if err := r.Database.Table("user_task").Create(&in).Error; err != nil {
		return err
	}
	out.Data = []*pb.UserTask{in}

	return nil
}

func (r *MySqlRepository) UpdateUserTask(ctx context.Context, item *pb.UserTask) (*pb.TsRes, error) {
	values := map[string]interface{}{
		"result": item.Result,
		"points": item.Points,
		"audit":  item.Audit,
		"status": item.Status,
	}
	if err := r.Database.Table("user_task").Where("id = ?", item.Id).Updates(values).Error; err != nil {
		return nil, err
	}

	return &pb.TsRes{Value: true}, nil
}

func (r *MySqlRepository) DeleteUserTask(ctx context.Context, in *pb.UserTask, out *pb.UserTasksResponse) error {
	if err := r.Database.Table("user_task").Delete(&pb.UserTask{}, "task_id = ?", in.TaskId).Error; err != nil {
		return err
	}
	out.Data = []*pb.UserTask{in}

	return nil
}

func (r *MySqlRepository) GetUserTask(ctx context.Context, req *pb.TsKeyword) (*pb.UserTask, error) {
	result := new(pb.UserTask)
	result.Id = req.Value
	if err := r.Database.Table("user_task").First(&result).Error; err != nil {
		return nil, err
	}

	return result, nil
}

func (r *MySqlRepository) GetUserTaskByUserID(ctx context.Context, req *pb.TsKeyword) (*pb.UserTasksRes, error) {
	result := new(pb.UserTasksRes)
	result.Data = make([]*pb.UserTask, 0)

	if err := r.Database.Table("user_task").Where("user_id = ?", req.Value).Find(&result.Data).Error; err != nil {
		return nil, err
	}

	return result, nil
}

func (r *MySqlRepository) GetUserTaskByTaskID(ctx context.Context, req *pb.TsKeyword) (*pb.UserTasksRes, error) {
	result := new(pb.UserTasksRes)
	result.Data = make([]*pb.UserTask, 0)

	if err := r.Database.Table("user_task").Where("task_id = ?", req.Value).Find(&result.Data).Error; err != nil {
		return nil, err
	}

	return result, nil
}

func (r *MySqlRepository) GetUserTasks(ctx context.Context, in *pb.UserTaskRequest, out *pb.UserTasksResponse) error {
	db := r.Database.Table("user_task")
	if len(in.UserId) > 0 {
		db = db.Where("user_id = ?", in.UserId)
	}
	if len(in.EventId) > 0 {
		db = db.Where("event_id = ?", in.EventId)
	}
	if len(in.CampId) > 0 {
		db = db.Where("camp_id = ?", in.CampId)
	}
	if len(in.CategoryId) > 0 {
		db = db.Where("task_category = ?", in.CategoryId)
	}
	if len(in.Sceneryspots) > 0 {
		db = db.Where("sceneryspot_id IN ?", in.Sceneryspots)
	}

	if err := db.Order("create_time DESC").Find(&out.Data).Error; err != nil {
		return err
	}

	return nil
}
