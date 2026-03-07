import Map "mo:core/Map";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";

actor {
  include MixinStorage();

  var counter = 0;

  func createId(prefix : Text) : Text {
    counter += 1;
    prefix # counter.toText();
  };

  public type Subject = {
    #math;
    #english;
  };

  module Subject {
    public func compare(x : Subject, y : Subject) : Order.Order {
      switch (x, y) {
        case (#math, #english) { #less };
        case (#english, #math) { #greater };
        case (_, _) { #equal };
      };
    };
  };

  public type Difficulty = {
    #beginner;
    #elementary;
    #intermediate;
    #advanced;
    #expert;
    #mastery;
  };

  public type User = {
    id : Text;
    principal : Principal;
    username : Text;
    age : Nat;
    avatarId : Text;
    xp : Nat;
    level : Nat;
    coins : Nat;
    gems : Nat;
    currentWorldId : Text;
    streakDays : Nat;
    lastLoginDate : Int;
    subjectProgress : [(Subject, Nat)];
  };

  public type World = {
    id : Text;
    name : Text;
    requiredLevel : Nat;
    isUnlocked : Bool;
    bossDefeated : Bool;
    subject : Subject;
    difficulty : Difficulty;
    unlockXp : Nat;
    order : Nat;
    description : Text;
  };

  public type Lesson = {
    id : Text;
    worldId : Text;
    subject : Subject;
    title : Text;
    difficulty : Difficulty;
    xpReward : Nat;
    coinReward : Nat;
    isBossBattle : Bool;
    question : Text;
    optionA : Text;
    optionB : Text;
    optionC : Text;
    optionD : Text;
    correctAnswer : Text;
  };

  public type Quest = {
    id : Text;
    title : Text;
    description : Text;
    xpReward : Nat;
    coinReward : Nat;
    isDaily : Bool;
    expiresAt : Int;
  };

  public type UserQuest = {
    userId : Text;
    questId : Text;
    completedAt : Int;
  };

  public type StreakRecord = {
    userId : Text;
    currentStreak : Nat;
    longestStreak : Nat;
    lastStreakDate : Int;
  };

  public type SkillNode = {
    id : Text;
    subject : Subject;
    name : Text;
    requiredLevel : Nat;
    prerequisiteIds : [Text];
  };

  public type UserSkillNode = {
    userId : Text;
    skillNodeId : Text;
    unlocked : Bool;
  };

  public type MultiplayerSession = {
    id : Text;
    hostId : Text;
    opponentId : ?Text;
    subject : Subject;
    status : SessionStatus;
    winnerId : ?Text;
  };

  public type SessionStatus = { #pending; #inProgress; #completed };
  public type Answer = { questionId : Text; isCorrect : Bool };

  public type TutorRecommendation = {
    recommendedLesson : Text;
    hint : Text;
    difficultyAdjustment : Difficulty;
  };

  public type PurchaseType = { #hintPack; #avatarCostume; #worldSkin };
  public type Purchase = {
    id : Text;
    userId : Text;
    itemType : PurchaseType;
    itemId : Text;
    cost : Nat;
    purchaseDate : Int;
  };

  public type LessonProgressRecord = {
    id : Text;
    userId : Text;
    lessonName : Text;
    worldName : Text;
    completed : Bool;
    score : Nat;
    xpEarned : Nat;
    dateCompleted : Int;
  };

  type UserInternal = {
    id : Text;
    principal : Principal;
    username : Text;
    age : Nat;
    avatarId : Text;
    xp : Nat;
    level : Nat;
    coins : Nat;
    gems : Nat;
    currentWorldId : Text;
    streakDays : Nat;
    lastLoginDate : Int;
    subjectProgress : Map.Map<Subject, Nat>;
  };

  func toUserView(user : UserInternal) : User {
    {
      id = user.id;
      principal = user.principal;
      username = user.username;
      age = user.age;
      avatarId = user.avatarId;
      xp = user.xp;
      level = user.level;
      coins = user.coins;
      gems = user.gems;
      currentWorldId = user.currentWorldId;
      streakDays = user.streakDays;
      lastLoginDate = user.lastLoginDate;
      subjectProgress = user.subjectProgress.toArray();
    };
  };

  public type UserProfile = {
    username : Text;
    age : Nat;
    avatarId : Text;
  };

  let users = Map.empty<Text, UserInternal>();
  let lessons = Map.empty<Text, Lesson>();
  let quests = Map.empty<Text, Quest>();
  let userQuests = Map.empty<Text, UserQuest>();
  let streakRecords = Map.empty<Text, StreakRecord>();
  let skillNodes = Map.empty<Text, SkillNode>();
  let userSkillNodes = Map.empty<Text, UserSkillNode>();
  let multiplayerSessions = Map.empty<Text, MultiplayerSession>();
  let purchases = Map.empty<Text, Purchase>();
  let userProgress = Map.empty<Text, ?Nat>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let progressLog = Map.empty<Text, LessonProgressRecord>();

  func getLessonNameById(lessonId : Text) : Text {
    switch (lessons.get(lessonId)) {
      case (null) { "Unknown Lesson" };
      case (?lesson) { lesson.title };
    };
  };

  func getWorldNameById(worldId : Text) : Text {
    switch (worldData.find(func(w) { w.id == worldId })) {
      case (null) { "Unknown World" };
      case (?world) { world.name };
    };
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let worldData : [World] = [
    {
      id = "world1";
      name = "Alphabet Forest";
      description = "Learn letters and basic words";
      requiredLevel = 1;
      unlockXp = 0;
      order = 1;
      subject = #english;
      difficulty = #beginner;
      isUnlocked = true;
      bossDefeated = false;
    },
    {
      id = "world2";
      name = "Grammar City";
      description = "Learn sentences and grammar";
      requiredLevel = 5;
      unlockXp = 100;
      order = 2;
      subject = #english;
      difficulty = #elementary;
      isUnlocked = false;
      bossDefeated = false;
    },
    {
      id = "world3";
      name = "Math Valley";
      description = "Learn addition and subtraction";
      requiredLevel = 10;
      unlockXp = 200;
      order = 3;
      subject = #math;
      difficulty = #elementary;
      isUnlocked = false;
      bossDefeated = false;
    },
    {
      id = "world4";
      name = "Algebra Mountains";
      description = "Learn equations and algebra";
      requiredLevel = 20;
      unlockXp = 400;
      order = 4;
      subject = #math;
      difficulty = #intermediate;
      isUnlocked = false;
      bossDefeated = false;
    },
    {
      id = "world5";
      name = "Master Volcano";
      description = "Final mastery challenges";
      requiredLevel = 40;
      unlockXp = 800;
      order = 5;
      subject = #math;
      difficulty = #mastery;
      isUnlocked = false;
      bossDefeated = false;
    },
  ];

  public query ({ caller }) func listWorlds() : async [World] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can list worlds");
    };
    worldData;
  };

  public query ({ caller }) func getWorld(id : Text) : async ?World {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view worlds");
    };
    worldData.find(func(w) { w.id == id });
  };

  func isWorldUnlocked(user : UserInternal, worldId : Text) : Bool {
    switch (worldData.find(func(w) { w.id == worldId })) {
      case (null) { false };
      case (?w) {
        if (user.level >= w.requiredLevel and user.xp >= w.unlockXp) {
          return true;
        };
        worldId == "world1";
      };
    };
  };

  public query ({ caller }) func getAvailableWorlds(userId : Text) : async [World] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can get available worlds");
    };
    switch (users.get(userId)) {
      case (null) { Runtime.trap("User not found") };
      case (?user) {
        worldData.map(func(w) {
          { w with isUnlocked = isWorldUnlocked(user, w.id) };
        });
      };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can get their profile");
    };
    userProfiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save their profile");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  func isUserAuthorized(caller : Principal, userId : Text) : Bool {
    switch (users.get(userId)) {
      case (null) { false };
      case (?user) {
        AccessControl.isAdmin(accessControlState, caller) or (user.principal == caller);
      };
    };
  };

  public shared ({ caller }) func createUser(username : Text, age : Nat, avatarId : Text) : async Text {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can create a user record");
    };
    let id = createId("user");
    let user : UserInternal = {
      id;
      principal = caller;
      username;
      age;
      avatarId;
      xp = 0;
      level = 1;
      coins = 0;
      gems = 0;
      currentWorldId = "world1";
      streakDays = 0;
      lastLoginDate = 0;
      subjectProgress = Map.empty<Subject, Nat>();
    };
    users.add(id, user);
    id;
  };

  public query ({ caller }) func getUser(id : Text) : async ?User {
    if (not isUserAuthorized(caller, id)) {
      Runtime.trap("Unauthorized: Can only view your own user record");
    };
    switch (users.get(id)) {
      case (null) { null };
      case (?user) { ?toUserView(user) };
    };
  };

  public shared ({ caller }) func updateUser(user : User) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can update a user record");
    };
    if (not isUserAuthorized(caller, user.id)) {
      Runtime.trap("Unauthorized: Can only update your own user record");
    };
    let subjectProgress = Map.empty<Subject, Nat>();
    for ((subject, progress) in user.subjectProgress.values()) {
      subjectProgress.add(subject, progress);
    };
    let newUser : UserInternal = {
      id = user.id;
      principal = user.principal;
      username = user.username;
      age = user.age;
      avatarId = user.avatarId;
      xp = user.xp;
      level = user.level;
      coins = user.coins;
      gems = user.gems;
      currentWorldId = user.currentWorldId;
      streakDays = user.streakDays;
      lastLoginDate = user.lastLoginDate;
      subjectProgress;
    };
    users.add(user.id, newUser);
  };

  public shared ({ caller }) func deleteUser(id : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can delete a user record");
    };
    if (not isUserAuthorized(caller, id)) {
      Runtime.trap("Unauthorized: Can only delete your own user record");
    };
    users.remove(id);
  };

  public shared ({ caller }) func createLesson(lesson : Lesson) : async Text {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create lessons");
    };
    let id = createId("lesson");
    let newLesson = { lesson with id };
    lessons.add(id, newLesson);
    id;
  };

  public query ({ caller }) func getLesson(id : Text) : async ?Lesson {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view lessons");
    };
    lessons.get(id);
  };

  public query ({ caller }) func listLessons() : async [Lesson] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can list lessons");
    };
    lessons.values().toArray();
  };

  public query ({ caller }) func getLessonsByWorld(worldId : Text) : async [Lesson] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view lessons");
    };
    lessons.values().toArray().filter(func(l) { l.worldId == worldId });
  };

  public shared ({ caller }) func updateLesson(lesson : Lesson) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update lessons");
    };
    lessons.add(lesson.id, lesson);
  };

  public shared ({ caller }) func deleteLesson(id : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete lessons");
    };
    lessons.remove(id);
  };

  public shared ({ caller }) func createQuest(quest : Quest) : async Text {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create quests");
    };
    let id = createId("quest");
    let newQuest = { quest with id };
    quests.add(id, newQuest);
    id;
  };

  public query ({ caller }) func getQuest(id : Text) : async ?Quest {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view quests");
    };
    quests.get(id);
  };

  public shared ({ caller }) func updateQuest(quest : Quest) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update quests");
    };
    quests.add(quest.id, quest);
  };

  public shared ({ caller }) func deleteQuest(id : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete quests");
    };
    quests.remove(id);
  };

  public query ({ caller }) func getDailyQuests(userId : Text) : async [Quest] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can get daily quests");
    };
    if (not isUserAuthorized(caller, userId)) {
      Runtime.trap("Unauthorized: Can only view your own daily quests");
    };
    let now = Time.now();
    quests.values().toArray().filter(func(q) { q.isDaily and q.expiresAt > now });
  };

  public shared ({ caller }) func completeQuest(userId : Text, questId : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can complete quests");
    };
    if (not isUserAuthorized(caller, userId)) {
      Runtime.trap("Unauthorized: Can only complete your own quests");
    };
    let key = userId # "_" # questId;
    switch (userQuests.get(key)) {
      case (?_) { Runtime.trap("Quest already completed") };
      case (null) {
        let uq : UserQuest = {
          userId;
          questId;
          completedAt = Time.now();
        };
        userQuests.add(key, uq);
        switch (quests.get(questId), users.get(userId)) {
          case (?quest, ?user) {
            let updated = {
              user with
              xp = user.xp + quest.xpReward;
              coins = user.coins + quest.coinReward;
            };
            users.add(userId, updated);
          };
          case _ {};
        };
      };
    };
  };

  public shared ({ caller }) func createSkillNode(skillNode : SkillNode) : async Text {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create skill nodes");
    };
    let id = createId("skill_node");
    let newSkillNode = { skillNode with id };
    skillNodes.add(id, newSkillNode);
    id;
  };

  public query ({ caller }) func getSkillNode(id : Text) : async ?SkillNode {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view skill nodes");
    };
    skillNodes.get(id);
  };

  public shared ({ caller }) func updateSkillNode(skillNode : SkillNode) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update skill nodes");
    };
    skillNodes.add(skillNode.id, skillNode);
  };

  public shared ({ caller }) func deleteSkillNode(id : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete skill nodes");
    };
    skillNodes.remove(id);
  };

  public query ({ caller }) func getSkillTree(subject : Subject) : async [SkillNode] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view the skill tree");
    };
    skillNodes.values().toArray().filter(func(n) { n.subject == subject });
  };

  public shared ({ caller }) func unlockSkillNode(userId : Text, nodeId : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can unlock skill nodes");
    };
    if (not isUserAuthorized(caller, userId)) {
      Runtime.trap("Unauthorized: Can only unlock skill nodes for yourself");
    };
    switch (skillNodes.get(nodeId), users.get(userId)) {
      case (null, _) { Runtime.trap("Skill node not found") };
      case (_, null) { Runtime.trap("User not found") };
      case (?node, ?user) {
        if (user.level < node.requiredLevel) {
          Runtime.trap("Insufficient level to unlock this skill node");
        };
        for (prereqId in node.prerequisiteIds.values()) {
          let key = userId # "_" # prereqId;
          switch (userSkillNodes.get(key)) {
            case (null) { Runtime.trap("Prerequisite skill node not unlocked: " # prereqId) };
            case (?usn) {
              if (not usn.unlocked) {
                Runtime.trap("Prerequisite skill node not unlocked: " # prereqId);
              };
            };
          };
        };
        let key = userId # "_" # nodeId;
        let usn : UserSkillNode = { userId; skillNodeId = nodeId; unlocked = true };
        userSkillNodes.add(key, usn);
      };
    };
  };

  public query ({ caller }) func getUserSkillNodes(userId : Text) : async [UserSkillNode] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view skill nodes");
    };
    if (not isUserAuthorized(caller, userId)) {
      Runtime.trap("Unauthorized: Can only view your own skill nodes");
    };
    userSkillNodes.values().toArray().filter(func(usn) { usn.userId == userId });
  };

  public shared ({ caller }) func recordLogin(userId : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can record logins");
    };
    if (not isUserAuthorized(caller, userId)) {
      Runtime.trap("Unauthorized: Can only record your own login");
    };
    let now = Time.now();
    let oneDayNs : Int = 86_400_000_000_000;
    switch (streakRecords.get(userId)) {
      case (null) {
        let record : StreakRecord = {
          userId;
          currentStreak = 1;
          longestStreak = 1;
          lastStreakDate = now;
        };
        streakRecords.add(userId, record);
      };
      case (?record) {
        let diff = now - record.lastStreakDate;
        let newStreak : Nat = if (diff >= oneDayNs and diff < 2 * oneDayNs) {
          record.currentStreak + 1;
        } else if (diff < oneDayNs) {
          record.currentStreak;
        } else {
          1;
        };
        let longest = if (newStreak > record.longestStreak) newStreak else record.longestStreak;
        let updated : StreakRecord = {
          userId;
          currentStreak = newStreak;
          longestStreak = longest;
          lastStreakDate = now;
        };
        streakRecords.add(userId, updated);
        switch (users.get(userId)) {
          case (?user) {
            users.add(userId, { user with streakDays = newStreak; lastLoginDate = now });
          };
          case (null) {};
        };
      };
    };
  };

  public query ({ caller }) func getStreakStatus(userId : Text) : async ?StreakRecord {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view streak status");
    };
    if (not isUserAuthorized(caller, userId)) {
      Runtime.trap("Unauthorized: Can only view your own streak status");
    };
    streakRecords.get(userId);
  };

  public shared ({ caller }) func claimStreakReward(userId : Text) : async Text {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can claim streak rewards");
    };
    if (not isUserAuthorized(caller, userId)) {
      Runtime.trap("Unauthorized: Can only claim your own streak rewards");
    };
    switch (streakRecords.get(userId), users.get(userId)) {
      case (null, _) { Runtime.trap("No streak record found") };
      case (_, null) { Runtime.trap("User not found") };
      case (?record, ?user) {
        let streak = record.currentStreak;
        var coinsReward : Nat = 0;
        var gemsReward : Nat = 0;
        var message = "No reward available";
        if (streak >= 30) {
          coinsReward := 500;
          gemsReward := 25;
          message := "Day 30 reward: 500 coins + 25 gems + exclusive world skin!";
        } else if (streak >= 14) {
          coinsReward := 200;
          gemsReward := 10;
          message := "Day 14 reward: 200 coins + 10 gems + avatar frame unlock!";
        } else if (streak >= 7) {
          coinsReward := 100;
          gemsReward := 5;
          message := "Day 7 reward: 100 coins + 5 gems!";
        } else if (streak >= 3) {
          coinsReward := 50;
          gemsReward := 0;
          message := "Day 3 reward: 50 coins!";
        };
        if (coinsReward > 0 or gemsReward > 0) {
          let updated = {
            user with
            coins = user.coins + coinsReward;
            gems = user.gems + gemsReward;
          };
          users.add(userId, updated);
        };
        message;
      };
    };
  };

  public shared ({ caller }) func createChallenge(hostId : Text, subject : Subject) : async Text {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can create challenges");
    };
    if (not isUserAuthorized(caller, hostId)) {
      Runtime.trap("Unauthorized: Can only create challenges as yourself");
    };
    let id = createId("session");
    let session : MultiplayerSession = {
      id;
      hostId;
      opponentId = null;
      subject;
      status = #pending;
      winnerId = null;
    };
    multiplayerSessions.add(id, session);
    id;
  };

  public shared ({ caller }) func joinChallenge(sessionId : Text, opponentId : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can join challenges");
    };
    if (not isUserAuthorized(caller, opponentId)) {
      Runtime.trap("Unauthorized: Can only join challenges as yourself");
    };
    switch (multiplayerSessions.get(sessionId)) {
      case (null) { Runtime.trap("Session not found") };
      case (?session) {
        if (session.status != #pending) {
          Runtime.trap("Session is not pending");
        };
        let updated = {
          session with
          opponentId = ?opponentId;
          status = #inProgress;
        };
        multiplayerSessions.add(sessionId, updated);
      };
    };
  };

  public shared ({ caller }) func submitAnswers(sessionId : Text, userId : Text, answers : [Answer]) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can submit answers");
    };
    if (not isUserAuthorized(caller, userId)) {
      Runtime.trap("Unauthorized: Can only submit answers as yourself");
    };
    switch (multiplayerSessions.get(sessionId)) {
      case (null) { Runtime.trap("Session not found") };
      case (?session) {
        let isHost = session.hostId == userId;
        let isOpponent = switch (session.opponentId) {
          case (?oid) { oid == userId };
          case (null) { false };
        };
        if (not isHost and not isOpponent) {
          Runtime.trap("Unauthorized: You are not a participant in this session");
        };
      };
    };
  };

  public shared ({ caller }) func resolveSession(sessionId : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can resolve sessions");
    };
    switch (multiplayerSessions.get(sessionId)) {
      case (null) { Runtime.trap("Session not found") };
      case (?session) {
        let callerIsAdmin = AccessControl.isAdmin(accessControlState, caller);
        let callerIsHost = isUserAuthorized(caller, session.hostId);
        let callerIsOpponent = switch (session.opponentId) {
          case (?oid) { isUserAuthorized(caller, oid) };
          case (null) { false };
        };
        if (not callerIsAdmin and not callerIsHost and not callerIsOpponent) {
          Runtime.trap("Unauthorized: Only participants or admins can resolve a session");
        };
        if (session.status == #completed) {
          Runtime.trap("Session already completed");
        };
        let updated = { session with status = #completed };
        multiplayerSessions.add(sessionId, updated);
      };
    };
  };

  public query ({ caller }) func getMultiplayerSession(sessionId : Text) : async ?MultiplayerSession {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view sessions");
    };
    switch (multiplayerSessions.get(sessionId)) {
      case (null) { null };
      case (?session) {
        let callerIsAdmin = AccessControl.isAdmin(accessControlState, caller);
        let callerIsHost = isUserAuthorized(caller, session.hostId);
        let callerIsOpponent = switch (session.opponentId) {
          case (?oid) { isUserAuthorized(caller, oid) };
          case (null) { false };
        };
        if (not callerIsAdmin and not callerIsHost and not callerIsOpponent) {
          Runtime.trap("Unauthorized: Only participants or admins can view this session");
        };
        ?session;
      };
    };
  };

  public query ({ caller }) func getTutorRecommendation(userId : Text, subject : Subject) : async TutorRecommendation {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can get tutor recommendations");
    };
    if (not isUserAuthorized(caller, userId)) {
      Runtime.trap("Unauthorized: Can only get recommendations for yourself");
    };
    {
      recommendedLesson = "lesson_beginner_1";
      hint = "Keep practicing! You are doing great.";
      difficultyAdjustment = #beginner;
    };
  };

  public shared ({ caller }) func recordLessonResult(userId : Text, lessonId : Text, score : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can record lesson results");
    };
    if (not isUserAuthorized(caller, userId)) {
      Runtime.trap("Unauthorized: Can only record your own lesson results");
    };
    let key = userId # "_" # lessonId;
    userProgress.add(key, ?score);
    switch (lessons.get(lessonId), users.get(userId)) {
      case (?lesson, ?user) {
        if (score > 0) {
          let updated = {
            user with
            xp = user.xp + lesson.xpReward;
            coins = user.coins + lesson.coinReward;
          };
          users.add(userId, updated);
        };
      };
      case _ {};
    };
  };

  public shared ({ caller }) func purchaseItem(userId : Text, itemType : PurchaseType, itemId : Text) : async Text {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can make purchases");
    };
    if (not isUserAuthorized(caller, userId)) {
      Runtime.trap("Unauthorized: Can only make purchases for yourself");
    };
    switch (users.get(userId)) {
      case (null) { Runtime.trap("User not found") };
      case (?user) {
        let (coinCost, gemCost) : (Nat, Nat) = switch (itemType) {
          case (#hintPack) { (50, 0) };
          case (#avatarCostume) { (0, 20) };
          case (#worldSkin) { (0, 30) };
        };
        if (coinCost > 0 and user.coins < coinCost) {
          Runtime.trap("Insufficient coins");
        };
        if (gemCost > 0 and user.gems < gemCost) {
          Runtime.trap("Insufficient gems");
        };
        let updated = {
          user with
          coins = if (coinCost > 0) { user.coins - coinCost } else { user.coins };
          gems = if (gemCost > 0) { user.gems - gemCost } else { user.gems };
        };
        users.add(userId, updated);
        let purchaseId = createId("purchase");
        let purchase : Purchase = {
          id = purchaseId;
          userId;
          itemType;
          itemId;
          cost = coinCost + gemCost;
          purchaseDate = Time.now();
        };
        purchases.add(purchaseId, purchase);
        purchaseId;
      };
    };
  };

  public query ({ caller }) func getUserPurchases(userId : Text) : async [Purchase] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view purchases");
    };
    if (not isUserAuthorized(caller, userId)) {
      Runtime.trap("Unauthorized: Can only view your own purchases");
    };
    purchases.values().toArray().filter(func(p) { p.userId == userId });
  };

  public query ({ caller }) func getWorldLessons(worldId : Text) : async [Lesson] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view lessons");
    };
    lessons.values().toArray().filter(func(l) { l.worldId == worldId });
  };

  public query ({ caller }) func getUserProgress(userId : Text) : async [LessonProgressRecord] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view progress");
    };
    if (not isUserAuthorized(caller, userId)) {
      Runtime.trap("Unauthorized: Can only view your own progress");
    };
    let progressList = List.empty<LessonProgressRecord>();
    for ((_, p) in progressLog.entries()) {
      if (p.userId == userId) { progressList.add(p) };
    };
    progressList.toArray();
  };

  public query ({ caller }) func getWorldProgress(userId : Text, worldName : Text) : async [LessonProgressRecord] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view world progress");
    };
    if (not isUserAuthorized(caller, userId)) {
      Runtime.trap("Unauthorized: Can only view your own world progress");
    };
    let progressList = List.empty<LessonProgressRecord>();
    for ((_, p) in progressLog.entries()) {
      if (p.userId == userId and p.worldName == worldName) {
        progressList.add(p);
      };
    };
    progressList.toArray();
  };

  public shared ({ caller }) func recordProgress(userId : Text, lessonName : Text, worldName : Text, score : Nat, xpEarned : Nat) : async Text {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can record progress");
    };
    if (not isUserAuthorized(caller, userId)) {
      Runtime.trap("Unauthorized: Can only record your own progress");
    };
    let id = createId("progress");
    let newProgress : LessonProgressRecord = {
      id;
      userId;
      lessonName;
      worldName;
      completed = true;
      score;
      xpEarned;
      dateCompleted = Time.now();
    };
    progressLog.add(id, newProgress);
    switch (users.get(userId)) {
      case (?user) {
        let updated = {
          user with
          xp = user.xp + xpEarned;
        };
        users.add(userId, updated);
      };
      case (null) {};
    };
    id;
  };
};
