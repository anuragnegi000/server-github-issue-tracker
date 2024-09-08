const ensureAuthenticated = require("../Middlewares/AuthEnsure.js");
const RepoModel = require("../Models/Repos.js");
const UserModel = require("../Models/Users");
const express = require("express");

const router = express.Router();

router.get("/:userID", ensureAuthenticated, async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.userID);
    const repos = await RepoModel.find({
      _id: { $in: user.repos },
    });
    res.json({ repos });
  } catch (error) {
    console.log(error);
    res.json(error);
  }
});
router.post("/create", ensureAuthenticated, async (req, res) => {
  try {
    const { repo_url, particular_user, UserId } = req.body;
    console.log(repo_url);
    console.log(UserId);

    const repo = await RepoModel.findOne({ repo_url });
    console.log(repo);
    if (repo && repo.UserId == UserId) {
      return res.json({ message: "repository already exists !" });
    }

    console.log("reached");
    const data = repo_url.slice(19);
    const repo_name = data.split("/")[1];

    const response = await fetch(`https://api.github.com/repos/${data}/issues`);
    console.log(`https://api.github.com/repos/${data}/issues`);

    let issues = await response.json();
    console.log("issues is", issues);

    // Check if issues is a string (stringified JSON) and parse it if so
    if (typeof issues === "string") {
      try {
        issues = JSON.parse(issues);
      } catch (parseError) {
        console.error("Error parsing issues:", parseError);
        return res
          .status(500)
          .json({ message: "Error parsing GitHub API response" });
      }
    }

    // Check if issues is an array and has at least one item
    if (!Array.isArray(issues) || issues.length === 0) {
      return res
        .status(400)
        .json({ message: "No issues found for this repository" });
    }

    const latest_issue = issues[0];
    console.log("latest_issue is", latest_issue);

    const last_issue_id = latest_issue.number;
    const last_issue_link = latest_issue.html_url;

    const upload = {
      repo_name,
      repo_url,
      last_issue_id,
      last_issue_link,
      UserId,
      ...(particular_user && { particular_user }),
    };

    console.log("Reached here-----111");
    const newRepo = new RepoModel(upload);
    await newRepo.save();
    console.log("Repo saved---------------");

    const user = await UserModel.findById({ _id: UserId });
    user.repos.push(newRepo);
    await user.save();
    console.log("user saved--------------------");

    return res.json({ success: true, message: "repo created successfully" });
  } catch (error) {
    console.error("Error in /create route:", error);
    return res
      .status(500)
      .json({ message: error.message || "An error occurred" });
  }
});

router.delete("/:repoId", ensureAuthenticated, async (req, res) => {
  try {
    const id = req.params.repoId;
    const repo = await RepoModel.findById(id);
    const userid = repo.UserId;
    await UserModel.updateOne({ _id: userid }, { $pull: { repos: id } });
    const status = await RepoModel.deleteOne({ _id: id });
    console.log("deleted");
    if (status) {
      return res.json({
        success: true,
        message: "repository deleted successfully",
      });
    }
  } catch (error) {
    return res.json({ message: error });
  }
});

router.put("/update", ensureAuthenticated, async (req, res) => {
  const { id, latest_issue_id, latest_issue_link } = req.body;
  const repo = await RepoModel.findById(id);
  try {
    if (repo && repo.last_issue_id) {
      console.log("Reached in first condition");
      if (latest_issue_id != null || latest_issue_id != undefined) {
        console.log("Reached in second condition");
        repo.last_issue_id = latest_issue_id;
        repo.last_issue_link = latest_issue_link;
        console.log("before save");
        await repo.save();
        console.log(repo);
      }

      res.json({
        success: true,
        message: "repository updated successfully",
      });
    }
  } catch (error) {
    res.json({ message: "error updating" });
  }
});

router.put("/update/user", ensureAuthenticated, async (req, res) => {
  console.log("agaya idhard");
  const { repo_id, particular_user } = req.body;
  const repo = await RepoModel.findById(repo_id);
  if (repo) {
    repo.particular_user = particular_user;
    await repo.save();
  } else {
    res.json({ message: "error updating" });
  }
});

module.exports = router;
