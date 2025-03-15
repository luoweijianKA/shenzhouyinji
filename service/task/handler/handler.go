package handler

import (
	"context"

	pb "gitlab.com/annoying-orange/shenzhouyinji/service/task/proto"
	repo "gitlab.com/annoying-orange/shenzhouyinji/service/task/repository"
)

type Handler struct {
	Repository repo.Repository
}

// Trek
func (h *Handler) CreateTrek(ctx context.Context, req *pb.Trek, res *pb.TsKeyword) error {
	result, err := h.Repository.CreateTrek(ctx, req)

	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) UpdateTrek(ctx context.Context, req *pb.Trek, res *pb.TsRes) error {
	result, err := h.Repository.UpdateTrek(ctx, req)

	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) GetTrek(ctx context.Context, req *pb.TsKeyword, res *pb.Trek) error {
	result, err := h.Repository.GetTrek(ctx, req)

	if err != nil {
		return err
	}

	res.Id = result.Id
	res.EventId = result.EventId
	res.SceneryspotId = result.SceneryspotId
	res.Name = result.Name
	res.Step = result.Step
	res.Points = result.Points
	res.Images = result.Images
	res.Introduction = result.Introduction
	res.StartTime = result.StartTime
	res.EndTime = result.EndTime
	res.Necessary = result.Necessary
	res.Status = result.Status
	res.CreateTime = result.CreateTime
	res.ElectricFence = result.ElectricFence

	return nil
}

func (h *Handler) GetTrekBySceneryspotID(ctx context.Context, req *pb.TsKeyword, res *pb.TreksRes) error {
	result, err := h.Repository.GetTrekBySceneryspotID(ctx, req)

	if err != nil {
		return err
	}

	res.Data = result.Data

	return nil
}

func (h *Handler) GetTreks(ctx context.Context, in *pb.TaskRequest, out *pb.TreksRes) error {
	return h.Repository.GetTreks(ctx, in, out)
}

// Geocaching
func (h *Handler) CreateGeocaching(ctx context.Context, req *pb.Geocaching, res *pb.TsKeyword) error {
	result, err := h.Repository.CreateGeocaching(ctx, req)

	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) UpdateGeocaching(ctx context.Context, req *pb.Geocaching, res *pb.TsRes) error {
	result, err := h.Repository.UpdateGeocaching(ctx, req)

	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) GetGeocaching(ctx context.Context, req *pb.TsKeyword, res *pb.Geocaching) error {
	result, err := h.Repository.GetGeocaching(ctx, req)

	if err != nil {
		return err
	}

	res.Id = result.Id
	res.EventId = result.EventId
	res.SceneryspotId = result.SceneryspotId
	res.Name = result.Name
	res.Points = result.Points
	res.Images = result.Images
	res.Introduction = result.Introduction
	res.StartTime = result.StartTime
	res.EndTime = result.EndTime
	res.Necessary = result.Necessary
	res.Status = result.Status
	res.CreateTime = result.CreateTime
	res.ElectricFence = result.ElectricFence

	return nil
}

func (h *Handler) GetGeocachingBySceneryspotID(ctx context.Context, req *pb.TsKeyword, res *pb.GeocachingsRes) error {
	result, err := h.Repository.GetGeocachingBySceneryspotID(ctx, req)

	if err != nil {
		return err
	}

	res.Data = result.Data

	return nil
}

func (h *Handler) GetGeocachings(ctx context.Context, in *pb.TaskRequest, out *pb.GeocachingsRes) error {
	return h.Repository.GetGeocachings(ctx, in, out)
}

// Screenshot
func (h *Handler) CreateScreenshot(ctx context.Context, req *pb.Screenshot, res *pb.TsKeyword) error {
	result, err := h.Repository.CreateScreenshot(ctx, req)

	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) UpdateScreenshot(ctx context.Context, req *pb.Screenshot, res *pb.TsRes) error {
	result, err := h.Repository.UpdateScreenshot(ctx, req)

	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) GetScreenshot(ctx context.Context, req *pb.TsKeyword, res *pb.Screenshot) error {
	result, err := h.Repository.GetScreenshot(ctx, req)

	if err != nil {
		return err
	}

	res.Id = result.Id
	res.EventId = result.EventId
	res.SceneryspotId = result.SceneryspotId
	res.Name = result.Name
	res.Points = result.Points
	res.Images = result.Images
	res.Introduction = result.Introduction
	res.StartTime = result.StartTime
	res.EndTime = result.EndTime
	res.Necessary = result.Necessary
	res.Status = result.Status
	res.CreateTime = result.CreateTime
	res.ElectricFence = result.ElectricFence

	return nil
}

func (h *Handler) GetScreenshotBySceneryspotID(ctx context.Context, req *pb.TsKeyword, res *pb.ScreenshotsRes) error {
	result, err := h.Repository.GetScreenshotBySceneryspotID(ctx, req)

	if err != nil {
		return err
	}

	res.Data = result.Data

	return nil
}

func (h *Handler) GetScreenshots(ctx context.Context, in *pb.TaskRequest, out *pb.ScreenshotsRes) error {
	return h.Repository.GetScreenshots(ctx, in, out)
}

// Puzzle
func (h *Handler) CreatePuzzle(ctx context.Context, req *pb.Puzzle, res *pb.TsKeyword) error {
	result, err := h.Repository.CreatePuzzle(ctx, req)

	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) UpdatePuzzle(ctx context.Context, req *pb.Puzzle, res *pb.TsRes) error {
	result, err := h.Repository.UpdatePuzzle(ctx, req)

	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) GetPuzzle(ctx context.Context, req *pb.TsKeyword, res *pb.Puzzle) error {
	result, err := h.Repository.GetPuzzle(ctx, req)

	if err != nil {
		return err
	}

	res.Id = result.Id
	res.EventId = result.EventId
	res.SceneryspotId = result.SceneryspotId
	res.Name = result.Name
	res.Countdown = result.Countdown
	res.Points = result.Points
	res.Images = result.Images
	res.Introduction = result.Introduction
	res.StartTime = result.StartTime
	res.EndTime = result.EndTime
	res.Necessary = result.Necessary
	res.Status = result.Status
	res.CreateTime = result.CreateTime
	res.ElectricFence = result.ElectricFence

	return nil
}

func (h *Handler) GetPuzzleBySceneryspotID(ctx context.Context, req *pb.TsKeyword, res *pb.PuzzlesRes) error {
	result, err := h.Repository.GetPuzzleBySceneryspotID(ctx, req)

	if err != nil {
		return err
	}

	res.Data = result.Data

	return nil
}

func (h *Handler) GetPuzzles(ctx context.Context, in *pb.TaskRequest, out *pb.PuzzlesRes) error {
	return h.Repository.GetPuzzles(ctx, in, out)
}

// QuestionBank
func (h *Handler) CreateQuestionBank(ctx context.Context, req *pb.QuestionBank, res *pb.TsKeyword) error {
	result, err := h.Repository.CreateQuestionBank(ctx, req)

	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) UpdateQuestionBank(ctx context.Context, req *pb.QuestionBank, res *pb.TsRes) error {
	result, err := h.Repository.UpdateQuestionBank(ctx, req)

	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) GetQuestionBank(ctx context.Context, req *pb.TsKeyword, res *pb.QuestionBank) error {
	result, err := h.Repository.GetQuestionBank(ctx, req)

	if err != nil {
		return err
	}

	res.Id = result.Id
	res.EventId = result.EventId
	res.SceneryspotId = result.SceneryspotId
	res.Question = result.Question
	res.Options = result.Options
	res.Answer = result.Answer
	res.Points = result.Points
	res.StartTime = result.StartTime
	res.EndTime = result.EndTime
	res.Necessary = result.Necessary
	res.Status = result.Status
	res.CreateTime = result.CreateTime
	res.ElectricFence = result.ElectricFence

	return nil
}

func (h *Handler) GetQuestionBankBySceneryspotID(ctx context.Context, req *pb.TsKeyword, res *pb.QuestionBanksRes) error {
	result, err := h.Repository.GetQuestionBankBySceneryspotID(ctx, req)

	if err != nil {
		return err
	}

	res.Data = result.Data

	return nil
}

func (h *Handler) GetQuestions(ctx context.Context, in *pb.TaskRequest, out *pb.QuestionBanksRes) error {
	return h.Repository.GetQuestions(ctx, in, out)
}

// Question
func (h *Handler) CreateQuestion(ctx context.Context, req *pb.Question, res *pb.TsKeyword) error {
	result, err := h.Repository.CreateQuestion(ctx, req)

	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) UpdateQuestion(ctx context.Context, req *pb.Question, res *pb.TsRes) error {
	result, err := h.Repository.UpdateQuestion(ctx, req)

	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) GetQuestion(ctx context.Context, req *pb.TsKeyword, res *pb.Question) error {
	result, err := h.Repository.GetQuestion(ctx, req)

	if err != nil {
		return err
	}

	res.Id = result.Id
	res.EventId = result.EventId
	res.SceneryspotId = result.SceneryspotId
	res.Questions = result.Questions
	res.StartTime = result.StartTime
	res.EndTime = result.EndTime
	res.Points = result.Points
	res.Status = result.Status
	res.CreateTime = result.CreateTime

	return nil
}

func (h *Handler) GetQuestionBySceneryspotID(ctx context.Context, req *pb.TsKeyword, res *pb.QuestionsRes) error {
	result, err := h.Repository.GetQuestionBySceneryspotID(ctx, req)

	if err != nil {
		return err
	}

	res.Data = result.Data

	return nil
}

// UserTask
func (h *Handler) CreateUserTask(ctx context.Context, in *pb.UserTask, out *pb.UserTasksResponse) error {
	return h.Repository.CreateUserTask(ctx, in, out)
}

func (h *Handler) UpdateUserTask(ctx context.Context, req *pb.UserTask, res *pb.TsRes) error {
	result, err := h.Repository.UpdateUserTask(ctx, req)

	if err != nil {
		return err
	}

	res.Value = result.Value

	return nil
}

func (h *Handler) GetUserTask(ctx context.Context, req *pb.TsKeyword, res *pb.UserTask) error {
	result, err := h.Repository.GetUserTask(ctx, req)

	if err != nil {
		return err
	}

	res.Id = result.Id
	res.UserId = result.UserId
	res.EventId = result.EventId
	res.CampId = result.CampId
	res.SceneryspotId = result.SceneryspotId
	res.TaskId = result.TaskId
	res.TaskCategory = result.TaskCategory
	res.Result = result.Result
	res.Points = result.Points
	res.Status = result.Status
	res.Audit = result.Audit
	res.CreateTime = result.CreateTime

	return nil
}

func (h *Handler) GetUserTaskByUserID(ctx context.Context, req *pb.TsKeyword, res *pb.UserTasksRes) error {
	result, err := h.Repository.GetUserTaskByUserID(ctx, req)

	if err != nil {
		return err
	}

	res.Data = result.Data

	return nil
}

func (h *Handler) GetUserTaskByTaskID(ctx context.Context, req *pb.TsKeyword, res *pb.UserTasksRes) error {
	result, err := h.Repository.GetUserTaskByTaskID(ctx, req)

	if err != nil {
		return err
	}

	res.Data = result.Data

	return nil
}

func (h *Handler) GetUserTasks(ctx context.Context, in *pb.UserTaskRequest, out *pb.UserTasksResponse) error {
	return h.Repository.GetUserTasks(ctx, in, out)
}
