import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import List "mo:core/List";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  include MixinStorage();

  var counter = 0;

  func createId(prefix : Text) : Text {
    counter += 1;
    prefix # counter.toText();
  };

  // Types
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

  // Immutable version used in public API
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

  // Mutable version for internal use only
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

  // Helper function to convert mutable UserInternal to immutable User
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

  // UserProfile type required by frontend
  public type UserProfile = {
    username : Text;
    age : Nat;
    avatarId : Text;
  };

  // Data Storage
  let users = Map.empty<Text, UserInternal>();
  let worlds = Map.empty<Text, World>();
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

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // ── User Profile (required by frontend) ──────────────────────────────────

  /// Get the caller's own profile.
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can get their profile");
    };
    userProfiles.get(caller);
  };

  /// Save / update the caller's own profile.
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save their profile");
    };
    userProfiles.add(caller, profile);
  };

  /// Fetch another user's profile. Callers may only view their own profile
  /// unless they are an admin.
  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  // ── User/Authorization Helper ─────────────────────────────────────────────

  /// Returns true when the caller is the owner of the given userId or an admin.
  func isUserAuthorized(caller : Principal, userId : Text) : Bool {
    switch (users.get(userId)) {
      case (null) { false };
      case (?user) {
        AccessControl.isAdmin(accessControlState, caller) or (user.principal == caller);
      };
    };
  };

  // ── CRUD for Users ────────────────────────────────────────────────────────

  /// Create a new game user record for the caller.
  /// Requires the caller to be an authenticated user (not a guest).
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

  /// Retrieve a user record. Only the owning principal or an admin may read it.
  public query ({ caller }) func getUser(id : Text) : async ?User {
    if (not isUserAuthorized(caller, id)) {
      Runtime.trap("Unauthorized: Can only view your own user record");
    };
    switch (users.get(id)) {
      case (null) { null };
      case (?user) { ?toUserView(user) };
    };
  };

  /// Update a user record. Only the owning principal or an admin may update it.
  public shared ({ caller }) func updateUser(user : User) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can update a user record");
    };
    if (not isUserAuthorized(caller, user.id)) {
      Runtime.trap("Unauthorized: Can only update your own user record");
    };
    let subjectProgress = Map.empty<Subject, Nat>();

    // Add entries from input array
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

  /// Delete a user record. Only the owning principal or an admin may delete it.
  public shared ({ caller }) func deleteUser(id : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can delete a user record");
    };
    if (not isUserAuthorized(caller, id)) {
      Runtime.trap("Unauthorized: Can only delete your own user record");
    };
    users.remove(id);
  };

  // ── CRUD for Worlds ───────────────────────────────────────────────────────

  /// Create a world. Admin only.
  public shared ({ caller }) func createWorld(world : World) : async Text {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create worlds");
    };
    let id = createId("world");
    let newWorld = { world with id };
    worlds.add(id, newWorld);
    id;
  };

  /// Read a world. Any authenticated user may read world data.
  public query ({ caller }) func getWorld(id : Text) : async ?World {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view worlds");
    };
    worlds.get(id);
  };

  /// List all worlds. Any authenticated user may list worlds.
  public query ({ caller }) func listWorlds() : async [World] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can list worlds");
    };
    worlds.values().toArray();
  };

  /// Update a world. Admin only.
  public shared ({ caller }) func updateWorld(world : World) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update worlds");
    };
    worlds.add(world.id, world);
  };

  /// Delete a world. Admin only.
  public shared ({ caller }) func deleteWorld(id : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete worlds");
    };
    worlds.remove(id);
  };

  // ── CRUD for Lessons ──────────────────────────────────────────────────────

  /// Create a lesson. Admin only.
  public shared ({ caller }) func createLesson(lesson : Lesson) : async Text {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create lessons");
    };
    let id = createId("lesson");
    let newLesson = { lesson with id };
    lessons.add(id, newLesson);
    id;
  };

  /// Read a lesson. Any authenticated user may read lesson data.
  public query ({ caller }) func getLesson(id : Text) : async ?Lesson {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view lessons");
    };
    lessons.get(id);
  };

  /// List all lessons. Any authenticated user may list lessons.
  public query ({ caller }) func listLessons() : async [Lesson] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can list lessons");
    };
    lessons.values().toArray();
  };

  /// List lessons for a specific world. Any authenticated user may call this.
  public query ({ caller }) func getLessonsByWorld(worldId : Text) : async [Lesson] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view lessons");
    };
    lessons.values().toArray().filter(func(l) { l.worldId == worldId });
  };

  /// Update a lesson. Admin only.
  public shared ({ caller }) func updateLesson(lesson : Lesson) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update lessons");
    };
    lessons.add(lesson.id, lesson);
  };

  /// Delete a lesson. Admin only.
  public shared ({ caller }) func deleteLesson(id : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete lessons");
    };
    lessons.remove(id);
  };

  // ── CRUD for Quests ───────────────────────────────────────────────────────

  /// Create a quest. Admin only.
  public shared ({ caller }) func createQuest(quest : Quest) : async Text {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create quests");
    };
    let id = createId("quest");
    let newQuest = { quest with id };
    quests.add(id, newQuest);
    id;
  };

  /// Read a quest. Any authenticated user may read quest data.
  public query ({ caller }) func getQuest(id : Text) : async ?Quest {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view quests");
    };
    quests.get(id);
  };

  /// Update a quest. Admin only.
  public shared ({ caller }) func updateQuest(quest : Quest) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update quests");
    };
    quests.add(quest.id, quest);
  };

  /// Delete a quest. Admin only.
  public shared ({ caller }) func deleteQuest(id : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete quests");
    };
    quests.remove(id);
  };

  // ── Daily Quests ──────────────────────────────────────────────────────────

  /// Get daily quests for a user. Only the owning user or an admin may call this.
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

  /// Complete a quest for a user. Only the owning user may complete their quests.
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
        // Award XP and coins
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

  // ── CRUD for SkillNodes ───────────────────────────────────────────────────

  /// Create a skill node. Admin only.
  public shared ({ caller }) func createSkillNode(skillNode : SkillNode) : async Text {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create skill nodes");
    };
    let id = createId("skill_node");
    let newSkillNode = { skillNode with id };
    skillNodes.add(id, newSkillNode);
    id;
  };

  /// Read a skill node. Any authenticated user may read skill node data.
  public query ({ caller }) func getSkillNode(id : Text) : async ?SkillNode {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view skill nodes");
    };
    skillNodes.get(id);
  };

  /// Update a skill node. Admin only.
  public shared ({ caller }) func updateSkillNode(skillNode : SkillNode) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update skill nodes");
    };
    skillNodes.add(skillNode.id, skillNode);
  };

  /// Delete a skill node. Admin only.
  public shared ({ caller }) func deleteSkillNode(id : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete skill nodes");
    };
    skillNodes.remove(id);
  };

  // ── Skill Tree ────────────────────────────────────────────────────────────

  /// Get all skill nodes for a subject. Any authenticated user may call this.
  public query ({ caller }) func getSkillTree(subject : Subject) : async [SkillNode] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view the skill tree");
    };
    skillNodes.values().toArray().filter(func(n) { n.subject == subject });
  };

  /// Unlock a skill node for a user. Only the owning user may unlock their nodes.
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
        // Check prerequisites
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

  /// Get all skill nodes unlocked by a user. Only the owning user or an admin may call this.
  public query ({ caller }) func getUserSkillNodes(userId : Text) : async [UserSkillNode] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view skill nodes");
    };
    if (not isUserAuthorized(caller, userId)) {
      Runtime.trap("Unauthorized: Can only view your own skill nodes");
    };
    userSkillNodes.values().toArray().filter(func(usn) { usn.userId == userId });
  };

  // ── Streak Rewards ────────────────────────────────────────────────────────

  /// Record a daily login for a user. Only the owning user may record their login.
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
          record.currentStreak; // same day, no change
        } else {
          1; // streak broken
        };
        let longest = if (newStreak > record.longestStreak) newStreak else record.longestStreak;
        let updated : StreakRecord = {
          userId;
          currentStreak = newStreak;
          longestStreak = longest;
          lastStreakDate = now;
        };
        streakRecords.add(userId, updated);
        // Update user streakDays
        switch (users.get(userId)) {
          case (?user) {
            users.add(userId, { user with streakDays = newStreak; lastLoginDate = now });
          };
          case (null) {};
        };
      };
    };
  };

  /// Get streak status for a user. Only the owning user or an admin may call this.
  public query ({ caller }) func getStreakStatus(userId : Text) : async ?StreakRecord {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view streak status");
    };
    if (not isUserAuthorized(caller, userId)) {
      Runtime.trap("Unauthorized: Can only view your own streak status");
    };
    streakRecords.get(userId);
  };

  /// Claim streak reward for a user. Only the owning user may claim their reward.
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

  // ── Multiplayer Competitions ──────────────────────────────────────────────

  /// Create a multiplayer challenge. Only authenticated users may create challenges.
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

  /// Join a multiplayer challenge. Only authenticated users may join challenges.
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

  /// Submit answers for a multiplayer session. Only the participating user may submit.
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
        // Verify the user is a participant
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

  /// Resolve a multiplayer session. Only authenticated users (participants) or admins may resolve.
  public shared ({ caller }) func resolveSession(sessionId : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can resolve sessions");
    };
    switch (multiplayerSessions.get(sessionId)) {
      case (null) { Runtime.trap("Session not found") };
      case (?session) {
        // Only participants or admins may resolve
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

  /// Get a multiplayer session. Participants or admins only.
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

  // ── AI Tutor ──────────────────────────────────────────────────────────────

  /// Get a tutor recommendation for a user. Only the owning user or an admin may call this.
  public query ({ caller }) func getTutorRecommendation(userId : Text, subject : Subject) : async TutorRecommendation {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can get tutor recommendations");
    };
    if (not isUserAuthorized(caller, userId)) {
      Runtime.trap("Unauthorized: Can only get recommendations for yourself");
    };
    // Rule-based adaptive logic placeholder
    {
      recommendedLesson = "lesson_beginner_1";
      hint = "Keep practicing! You are doing great.";
      difficultyAdjustment = #beginner;
    };
  };

  /// Record a lesson result for a user. Only the owning user may record their results.
  public shared ({ caller }) func recordLessonResult(userId : Text, lessonId : Text, score : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can record lesson results");
    };
    if (not isUserAuthorized(caller, userId)) {
      Runtime.trap("Unauthorized: Can only record your own lesson results");
    };
    let key = userId # "_" # lessonId;
    userProgress.add(key, ?score);
    // Award XP/coins based on score
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

  // ── Shop / Game Economy ───────────────────────────────────────────────────

  /// Purchase an item from the shop. Only the owning user may make purchases.
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

  /// Get all purchases for a user. Only the owning user or an admin may call this.
  public query ({ caller }) func getUserPurchases(userId : Text) : async [Purchase] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view purchases");
    };
    if (not isUserAuthorized(caller, userId)) {
      Runtime.trap("Unauthorized: Can only view your own purchases");
    };
    purchases.values().toArray().filter(func(p) { p.userId == userId });
  };
};
