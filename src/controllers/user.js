/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-sequences */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
'use strict';
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
exports.__esModule = true;
var user_1 = require("../models/user");
var follow_1 = require("../models/follow");
var publication_1 = require("../models/publication");
var generateJWT_1 = require("../helpers/generateJWT");
var generateId_1 = require("../helpers/generateId");
var emailRegister_1 = require("../helpers/emailRegister");
var emailForgotPassword_1 = require("../helpers/emailForgotPassword");
var loggers_1 = require("../helpers/loggers");
// --------------------------------------------------------
/**
 *
 * @param req
 * @param res
 * @returns { IUser }
 */
function saveUser(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, fullname, username, email, password, existUser, user, userSaved, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = req.body, fullname = _a.fullname, username = _a.username, email = _a.email, password = _a.password;
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, user_1["default"].findOne({ email: email })];
                case 2:
                    existUser = _b.sent();
                    if (existUser) {
                        return [2 /*return*/, res.status(400).json({ msg: 'Email no disponible' })];
                    }
                    user = new user_1["default"]({ fullname: fullname, username: username, email: email, password: password });
                    return [4 /*yield*/, user.save()
                        // Send email confirmation
                    ];
                case 3:
                    userSaved = _b.sent();
                    // Send email confirmation
                    return [4 /*yield*/, emailRegister_1["default"]({
                            email: email,
                            fullname: fullname,
                            token: userSaved.token
                        })];
                case 4:
                    // Send email confirmation
                    _b.sent();
                    return [2 /*return*/, res.status(201).json({ msg: 'Usuario creado con exito' })];
                case 5:
                    error_1 = _b.sent();
                    loggers_1.logError(error_1);
                    return [2 /*return*/, res.status(500).json({ error: error_1, msg: 'Error interno del API' })];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function userConfirm(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var token, confirm_1, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    token = req.params.token;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, user_1["default"].findOne({ token: token })];
                case 2:
                    confirm_1 = _a.sent();
                    if (confirm_1 === null) {
                        return [2 /*return*/, res.status(404).json({ msg: 'Token no valido' })];
                    }
                    (confirm_1.token = null), (confirm_1.confirmed = true);
                    return [4 /*yield*/, confirm_1.save()];
                case 3:
                    _a.sent();
                    res.status(200).json({ msg: 'Usuario confirmado correctamente' });
                    return [3 /*break*/, 5];
                case 4:
                    error_2 = _a.sent();
                    loggers_1.logError(error_2);
                    return [2 /*return*/, res.status(500).json({ msg: 'Error interno del API' })];
                case 5: return [2 /*return*/];
            }
        });
    });
}
// USER LOGIN
function userLogin(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, email, password, existUser, isPasswordCorrect, error_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = req.body, email = _a.email, password = _a.password;
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, user_1["default"].findOne({ email: email })];
                case 2:
                    existUser = _b.sent();
                    if (existUser == null) {
                        return [2 /*return*/, res.status(404).json({ msg: 'El usuario no existe' })];
                    }
                    // Check if the user has confirmed his account
                    if (!existUser.confirmed) {
                        return [2 /*return*/, res.status(401).json({ msg: 'Tu cuenta no ha sido confirmada' })];
                    }
                    return [4 /*yield*/, existUser.authenticate(password)];
                case 3:
                    isPasswordCorrect = _b.sent();
                    if (!isPasswordCorrect) {
                        return [2 /*return*/, res.status(401).json({ msg: 'La contraseña es incorrecta' })];
                    }
                    // Authenticate user
                    return [2 /*return*/, res.status(200).json({
                            _id: existUser._id,
                            fullname: existUser.fullname,
                            email: existUser.email,
                            token: generateJWT_1["default"](existUser._id)
                        })];
                case 4:
                    error_3 = _b.sent();
                    loggers_1.logError(error_3);
                    return [2 /*return*/, res.status(500).json({ msg: 'Error interno del API' })];
                case 5: return [2 /*return*/];
            }
        });
    });
}
// User Profile, this method takes the user to the home page after authentication 
function homeUser(req, res) {
    var user = req.user;
    return res.status(200).json(user);
}
function forgotPassword(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var email, existUser, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    email = req.body.email;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, user_1["default"].findOne({ email: email })];
                case 2:
                    existUser = _a.sent();
                    if (existUser == null) {
                        return [2 /*return*/, res.status(404).json({ msg: 'El usuario no existe' })];
                    }
                    existUser.token = generateId_1["default"]();
                    return [4 /*yield*/, existUser.save()
                        // Send email with instructions
                    ];
                case 3:
                    _a.sent();
                    // Send email with instructions
                    return [4 /*yield*/, emailForgotPassword_1["default"]({
                            email: email,
                            fullname: existUser.fullname,
                            token: existUser.token
                        })];
                case 4:
                    // Send email with instructions
                    _a.sent();
                    return [2 /*return*/, res.status(200).json({ msg: 'Hemos enviado un email con los pasos para cambiar la contraseña' })];
                case 5:
                    error_4 = _a.sent();
                    loggers_1.logError(error_4);
                    return [2 /*return*/, res.status(500).json({ msg: 'Error interno del API' })];
                case 6: return [2 /*return*/];
            }
        });
    });
}
// Method to check password
function checkToken(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var token, validToken, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    token = req.params.token;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, user_1["default"].findOne({ token: token })];
                case 2:
                    validToken = _a.sent();
                    if (validToken !== null) {
                        return [2 /*return*/, res.status(200).json({ msg: 'Token válido' })];
                    }
                    else {
                        return [2 /*return*/, res.status(400).json({ msg: 'Token no válido' })];
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_5 = _a.sent();
                    loggers_1.logError(error_5);
                    return [2 /*return*/, res.status(500).json({ msg: 'Error interno del API' })];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Method to assign a new password
function newPassword(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var token, password, user, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    token = req.params.token;
                    password = req.body.password;
                    if (!password || password < 7) {
                        return [2 /*return*/, res.status(400).json({ msg: 'La contraseña debe ser de al menos 7 dígitos' })];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, user_1["default"].findOne({ token: token })];
                case 2:
                    user = _a.sent();
                    if (user === null) {
                        return [2 /*return*/, res.status(400).json({ msg: 'Token inválido o expiró' })];
                    }
                    user.token = null;
                    user.password = password;
                    return [4 /*yield*/, user.save()];
                case 3:
                    _a.sent();
                    return [2 /*return*/, res.status(200).json({ msg: 'Password modificado correctamente' })];
                case 4:
                    error_6 = _a.sent();
                    loggers_1.logError(error_6);
                    return [2 /*return*/, res.status(500).json({ msg: 'Error interno del API' })];
                case 5: return [2 /*return*/];
            }
        });
    });
}
// METHOD TO EXTRACT USER DATA
// THIS METHOD IS PENDING TO BE REVIEWED, IT CURRENTLY FETCHES THE USER REQUESTED BY ITS ID BUT
// THE VALUE OBJECT THAT IT SHOULD BRING IF IT FOLLOWS AND IS FOLLOWED BY THE USER THAT IS LOGGED IN, IS EMPTY.
function getUser(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var userId, userLog, user, followerInfo, error_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    userId = req.params.id;
                    userLog = req.user._id;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, user_1["default"].findById(userId).select('password, token, role, confirmed, image, __v')];
                case 2:
                    user = _a.sent();
                    if (!user) {
                        return [2 /*return*/, res.status(404).send({ msg: 'El usuario no existe' })];
                    }
                    return [4 /*yield*/, followThisUser(userLog, userId)];
                case 3:
                    followerInfo = _a.sent();
                    return [2 /*return*/, res.status(200).json({ user: user.toObject(), followerInfo: followerInfo })];
                case 4:
                    error_7 = _a.sent();
                    loggers_1.logError(error_7);
                    return [2 /*return*/, res.status(500).json({ msg: 'Error interno del API' })];
                case 5: return [2 /*return*/];
            }
        });
    });
}
// METHOD FOR RETURNING A LIST OF PAGINATED USERS (Check the pagination)
function getUsers(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var identityId, page, options, users, userResponse, _a, following, followed, error_8;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    identityId = req.user;
                    page = req.params.page || 1;
                    options = {
                        page: page,
                        limit: 5
                    };
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, user_1["default"].paginate({}, options)];
                case 2:
                    users = _b.sent();
                    if (!users || !users.docs) {
                        return [2 /*return*/, res.send(404).json({ msg: 'No hay usuarios disponibles' })];
                    }
                    userResponse = users.docs.map(function (_a) {
                        var passwor = _a.passwor, role = _a.role, image = _a.image, token = _a.token, confirmed = _a.confirmed, __v = _a.__v, user = __rest(_a, ["passwor", "role", "image", "token", "confirmed", "__v"]);
                        return user;
                    });
                    return [4 /*yield*/, followUserIds(identityId)];
                case 3:
                    _a = _b.sent(), following = _a.following, followed = _a.followed;
                    return [2 /*return*/, res.status(200).json({
                            users: userResponse,
                            user_following: following,
                            user_followed_me: followed,
                            total: users.totalDocs,
                            pages: users.totalPages
                        })];
                case 4:
                    error_8 = _b.sent();
                    loggers_1.logError(error_8);
                    return [2 /*return*/, res.status(500).json({ msg: 'Error interno del API' })];
                case 5: return [2 /*return*/];
            }
        });
    });
}
// METHOD TO COUNT THE USERS I FOLLOW, THOSE WHO FOLLOW ME AND PUBLICATIONS
function getCounters(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var userId, value, error_9;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    userId = req.params.id || req.user._id;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, getCountFollow(userId)];
                case 2:
                    value = _a.sent();
                    if (!value) {
                        return [2 /*return*/, res.status(500).json({ msg: 'Algo salio mal' })];
                    }
                    else {
                        return [2 /*return*/, res.status(200).json({ value: value })];
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_9 = _a.sent();
                    loggers_1.logError(error_9);
                    return [2 /*return*/, res.status(500).json({ msg: 'Error interno del API' })];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// METHOD TO UPDATE A USER'S DATA
function updateUser(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var userId, userIdentity, update, userUpdated, _a, password, token, role, confirmed, image, __v, newUser, error_10;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    userId = req.params.id;
                    userIdentity = req.user._id;
                    update = __assign({}, req.body);
                    // Delete the password that comes in the user request
                    delete update.password;
                    if (userIdentity.toString() !== userId) {
                        return [2 /*return*/, res.status(403).json({ msg: 'No tienes permiso para actualizar este usuario' })];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, user_1["default"].findByIdAndUpdate(userId, update, { "new": true })];
                case 2:
                    userUpdated = _b.sent();
                    if (!userUpdated) {
                        return [2 /*return*/, res.status(404).json({ msg: 'No se ha podido actualizar el usuario' })];
                    }
                    _a = userUpdated.toObject(), password = _a.password, token = _a.token, role = _a.role, confirmed = _a.confirmed, image = _a.image, __v = _a.__v, newUser = __rest(_a, ["password", "token", "role", "confirmed", "image", "__v"]);
                    return [2 /*return*/, res.status(200).json({ user: newUser })];
                case 3:
                    error_10 = _b.sent();
                    loggers_1.logError(error_10);
                    return [2 /*return*/, res.status(500).json({ msg: 'Error interno del API' })];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Internal Controller Functions
function followThisUser(identityUserId, userId) {
    return __awaiter(this, void 0, void 0, function () {
        var following, followed, error_11;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, follow_1["default"].findOne({
                            user: identityUserId,
                            followed: userId
                        })];
                case 1:
                    following = _a.sent();
                    return [4 /*yield*/, follow_1["default"].findOne({
                            user: userId,
                            followed: identityUserId
                        })];
                case 2:
                    followed = _a.sent();
                    return [2 /*return*/, { following: following, followed: followed }];
                case 3:
                    error_11 = _a.sent();
                    loggers_1.logError(error_11);
                    return [2 /*return*/, { following: null, followed: null }];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function followUserIds(userId) {
    return __awaiter(this, void 0, void 0, function () {
        var following, followed, following_clean, followed_clean, error_12;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, follow_1["default"].find({ user: userId }).select({ _id: 0, __v: 0, user: 0 }).exec()];
                case 1:
                    following = _a.sent();
                    return [4 /*yield*/, follow_1["default"].find({ followed: userId }).select({ _id: 0, __v: 0, followed: 0 }).exec()
                        // Procesar following ids
                    ];
                case 2:
                    followed = _a.sent();
                    following_clean = following.map(function (follow) { return follow.followed; });
                    followed_clean = followed.map(function (follow) { return follow.user; });
                    return [2 /*return*/, {
                            following: following_clean,
                            followed: followed_clean
                        }];
                case 3:
                    error_12 = _a.sent();
                    loggers_1.logError(error_12);
                    return [2 /*return*/, { following: [], followed: [] }];
                case 4: return [2 /*return*/];
            }
        });
    });
}
var getCountFollow = function (userId) { return __awaiter(void 0, void 0, void 0, function () {
    var following, followed, publication, error_13;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                return [4 /*yield*/, follow_1["default"].countDocuments({ user: userId })];
            case 1:
                following = _a.sent();
                return [4 /*yield*/, follow_1["default"].countDocuments({ followed: userId })];
            case 2:
                followed = _a.sent();
                return [4 /*yield*/, publication_1["default"].countDocuments({ user: userId })];
            case 3:
                publication = _a.sent();
                return [2 /*return*/, { following: following, followed: followed, publication: publication }];
            case 4:
                error_13 = _a.sent();
                loggers_1.logError(error_13);
                return [2 /*return*/, { following: null, followed: null, publication: null }];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports["default"] = {
    saveUser: saveUser,
    userConfirm: userConfirm,
    userLogin: userLogin,
    homeUser: homeUser,
    forgotPassword: forgotPassword,
    checkToken: checkToken,
    newPassword: newPassword,
    getUser: getUser,
    getUsers: getUsers,
    getCounters: getCounters,
    updateUser: updateUser
};
