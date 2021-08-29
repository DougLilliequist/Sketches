var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[Object.keys(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};

// node_modules/spotify-web-api-js/src/spotify-web-api.js
var require_spotify_web_api = __commonJS({
  "node_modules/spotify-web-api-js/src/spotify-web-api.js"(exports, module2) {
    "use strict";
    var SpotifyWebApi2 = function() {
      var _baseUri = "https://api.spotify.com/v1";
      var _accessToken = null;
      var _promiseImplementation = null;
      var WrapPromiseWithAbort = function(promise, onAbort) {
        promise.abort = onAbort;
        return promise;
      };
      var _promiseProvider = function(promiseFunction, onAbort) {
        var returnedPromise;
        if (_promiseImplementation !== null) {
          var deferred = _promiseImplementation.defer();
          promiseFunction(function(resolvedResult) {
            deferred.resolve(resolvedResult);
          }, function(rejectedResult) {
            deferred.reject(rejectedResult);
          });
          returnedPromise = deferred.promise;
        } else {
          if (window.Promise) {
            returnedPromise = new window.Promise(promiseFunction);
          }
        }
        if (returnedPromise) {
          return new WrapPromiseWithAbort(returnedPromise, onAbort);
        } else {
          return null;
        }
      };
      var _extend = function() {
        var args = Array.prototype.slice.call(arguments);
        var target = args[0];
        var objects = args.slice(1);
        target = target || {};
        objects.forEach(function(object) {
          for (var j in object) {
            if (object.hasOwnProperty(j)) {
              target[j] = object[j];
            }
          }
        });
        return target;
      };
      var _buildUrl = function(url, parameters) {
        var qs = "";
        for (var key in parameters) {
          if (parameters.hasOwnProperty(key)) {
            var value = parameters[key];
            qs += encodeURIComponent(key) + "=" + encodeURIComponent(value) + "&";
          }
        }
        if (qs.length > 0) {
          qs = qs.substring(0, qs.length - 1);
          url = url + "?" + qs;
        }
        return url;
      };
      var _performRequest = function(requestData, callback) {
        var req = new XMLHttpRequest();
        var promiseFunction = function(resolve2, reject) {
          function success(data) {
            if (resolve2) {
              resolve2(data);
            }
            if (callback) {
              callback(null, data);
            }
          }
          function failure() {
            if (reject) {
              reject(req);
            }
            if (callback) {
              callback(req, null);
            }
          }
          var type = requestData.type || "GET";
          req.open(type, _buildUrl(requestData.url, requestData.params));
          if (_accessToken) {
            req.setRequestHeader("Authorization", "Bearer " + _accessToken);
          }
          req.onreadystatechange = function() {
            if (req.readyState === 4) {
              var data = null;
              try {
                data = req.responseText ? JSON.parse(req.responseText) : "";
              } catch (e) {
                console.error(e);
              }
              if (req.status >= 200 && req.status < 300) {
                success(data);
              } else {
                failure();
              }
            }
          };
          if (type === "GET") {
            req.send(null);
          } else {
            var postData = null;
            if (requestData.postData) {
              if (requestData.contentType === "image/jpeg") {
                postData = requestData.postData;
                req.setRequestHeader("Content-Type", requestData.contentType);
              } else {
                postData = JSON.stringify(requestData.postData);
                req.setRequestHeader("Content-Type", "application/json");
              }
            }
            req.send(postData);
          }
        };
        if (callback) {
          promiseFunction();
          return null;
        } else {
          return _promiseProvider(promiseFunction, function() {
            req.abort();
          });
        }
      };
      var _checkParamsAndPerformRequest = function(requestData, options2, callback, optionsAlwaysExtendParams) {
        var opt = {};
        var cb = null;
        if (typeof options2 === "object") {
          opt = options2;
          cb = callback;
        } else if (typeof options2 === "function") {
          cb = options2;
        }
        var type = requestData.type || "GET";
        if (type !== "GET" && requestData.postData && !optionsAlwaysExtendParams) {
          requestData.postData = _extend(requestData.postData, opt);
        } else {
          requestData.params = _extend(requestData.params, opt);
        }
        return _performRequest(requestData, cb);
      };
      var Constr = function() {
      };
      Constr.prototype = {
        constructor: SpotifyWebApi2
      };
      Constr.prototype.getGeneric = function(url, callback) {
        var requestData = {
          url
        };
        return _checkParamsAndPerformRequest(requestData, callback);
      };
      Constr.prototype.getMe = function(options2, callback) {
        var requestData = {
          url: _baseUri + "/me"
        };
        return _checkParamsAndPerformRequest(requestData, options2, callback);
      };
      Constr.prototype.getMySavedTracks = function(options2, callback) {
        var requestData = {
          url: _baseUri + "/me/tracks"
        };
        return _checkParamsAndPerformRequest(requestData, options2, callback);
      };
      Constr.prototype.addToMySavedTracks = function(trackIds, options2, callback) {
        var requestData = {
          url: _baseUri + "/me/tracks",
          type: "PUT",
          postData: trackIds
        };
        return _checkParamsAndPerformRequest(requestData, options2, callback);
      };
      Constr.prototype.removeFromMySavedTracks = function(trackIds, options2, callback) {
        var requestData = {
          url: _baseUri + "/me/tracks",
          type: "DELETE",
          postData: trackIds
        };
        return _checkParamsAndPerformRequest(requestData, options2, callback);
      };
      Constr.prototype.containsMySavedTracks = function(trackIds, options2, callback) {
        var requestData = {
          url: _baseUri + "/me/tracks/contains",
          params: { ids: trackIds.join(",") }
        };
        return _checkParamsAndPerformRequest(requestData, options2, callback);
      };
      Constr.prototype.getMySavedAlbums = function(options2, callback) {
        var requestData = {
          url: _baseUri + "/me/albums"
        };
        return _checkParamsAndPerformRequest(requestData, options2, callback);
      };
      Constr.prototype.addToMySavedAlbums = function(albumIds, options2, callback) {
        var requestData = {
          url: _baseUri + "/me/albums",
          type: "PUT",
          postData: albumIds
        };
        return _checkParamsAndPerformRequest(requestData, options2, callback);
      };
      Constr.prototype.removeFromMySavedAlbums = function(albumIds, options2, callback) {
        var requestData = {
          url: _baseUri + "/me/albums",
          type: "DELETE",
          postData: albumIds
        };
        return _checkParamsAndPerformRequest(requestData, options2, callback);
      };
      Constr.prototype.containsMySavedAlbums = function(albumIds, options2, callback) {
        var requestData = {
          url: _baseUri + "/me/albums/contains",
          params: { ids: albumIds.join(",") }
        };
        return _checkParamsAndPerformRequest(requestData, options2, callback);
      };
      Constr.prototype.getMyTopArtists = function(options2, callback) {
        var requestData = {
          url: _baseUri + "/me/top/artists"
        };
        return _checkParamsAndPerformRequest(requestData, options2, callback);
      };
      Constr.prototype.getMyTopTracks = function(options2, callback) {
        var requestData = {
          url: _baseUri + "/me/top/tracks"
        };
        return _checkParamsAndPerformRequest(requestData, options2, callback);
      };
      Constr.prototype.getMyRecentlyPlayedTracks = function(options2, callback) {
        var requestData = {
          url: _baseUri + "/me/player/recently-played"
        };
        return _checkParamsAndPerformRequest(requestData, options2, callback);
      };
      Constr.prototype.followUsers = function(userIds, callback) {
        var requestData = {
          url: _baseUri + "/me/following/",
          type: "PUT",
          params: {
            ids: userIds.join(","),
            type: "user"
          }
        };
        return _checkParamsAndPerformRequest(requestData, callback);
      };
      Constr.prototype.followArtists = function(artistIds, callback) {
        var requestData = {
          url: _baseUri + "/me/following/",
          type: "PUT",
          params: {
            ids: artistIds.join(","),
            type: "artist"
          }
        };
        return _checkParamsAndPerformRequest(requestData, callback);
      };
      Constr.prototype.followPlaylist = function(playlistId, options2, callback) {
        var requestData = {
          url: _baseUri + "/playlists/" + playlistId + "/followers",
          type: "PUT",
          postData: {}
        };
        return _checkParamsAndPerformRequest(requestData, options2, callback);
      };
      Constr.prototype.unfollowUsers = function(userIds, callback) {
        var requestData = {
          url: _baseUri + "/me/following/",
          type: "DELETE",
          params: {
            ids: userIds.join(","),
            type: "user"
          }
        };
        return _checkParamsAndPerformRequest(requestData, callback);
      };
      Constr.prototype.unfollowArtists = function(artistIds, callback) {
        var requestData = {
          url: _baseUri + "/me/following/",
          type: "DELETE",
          params: {
            ids: artistIds.join(","),
            type: "artist"
          }
        };
        return _checkParamsAndPerformRequest(requestData, callback);
      };
      Constr.prototype.unfollowPlaylist = function(playlistId, callback) {
        var requestData = {
          url: _baseUri + "/playlists/" + playlistId + "/followers",
          type: "DELETE"
        };
        return _checkParamsAndPerformRequest(requestData, callback);
      };
      Constr.prototype.isFollowingUsers = function(userIds, callback) {
        var requestData = {
          url: _baseUri + "/me/following/contains",
          type: "GET",
          params: {
            ids: userIds.join(","),
            type: "user"
          }
        };
        return _checkParamsAndPerformRequest(requestData, callback);
      };
      Constr.prototype.isFollowingArtists = function(artistIds, callback) {
        var requestData = {
          url: _baseUri + "/me/following/contains",
          type: "GET",
          params: {
            ids: artistIds.join(","),
            type: "artist"
          }
        };
        return _checkParamsAndPerformRequest(requestData, callback);
      };
      Constr.prototype.areFollowingPlaylist = function(playlistId, userIds, callback) {
        var requestData = {
          url: _baseUri + "/playlists/" + playlistId + "/followers/contains",
          type: "GET",
          params: {
            ids: userIds.join(",")
          }
        };
        return _checkParamsAndPerformRequest(requestData, callback);
      };
      Constr.prototype.getFollowedArtists = function(options2, callback) {
        var requestData = {
          url: _baseUri + "/me/following",
          type: "GET",
          params: {
            type: "artist"
          }
        };
        return _checkParamsAndPerformRequest(requestData, options2, callback);
      };
      Constr.prototype.getUser = function(userId, options2, callback) {
        var requestData = {
          url: _baseUri + "/users/" + encodeURIComponent(userId)
        };
        return _checkParamsAndPerformRequest(requestData, options2, callback);
      };
      Constr.prototype.getUserPlaylists = function(userId, options2, callback) {
        var requestData;
        if (typeof userId === "string") {
          requestData = {
            url: _baseUri + "/users/" + encodeURIComponent(userId) + "/playlists"
          };
        } else {
          requestData = {
            url: _baseUri + "/me/playlists"
          };
          callback = options2;
          options2 = userId;
        }
        return _checkParamsAndPerformRequest(requestData, options2, callback);
      };
      Constr.prototype.getPlaylist = function(playlistId, options2, callback) {
        var requestData = {
          url: _baseUri + "/playlists/" + playlistId
        };
        return _checkParamsAndPerformRequest(requestData, options2, callback);
      };
      Constr.prototype.getPlaylistTracks = function(playlistId, options2, callback) {
        var requestData = {
          url: _baseUri + "/playlists/" + playlistId + "/tracks"
        };
        return _checkParamsAndPerformRequest(requestData, options2, callback);
      };
      Constr.prototype.getPlaylistCoverImage = function(playlistId, callback) {
        var requestData = {
          url: _baseUri + "/playlists/" + playlistId + "/images"
        };
        return _checkParamsAndPerformRequest(requestData, callback);
      };
      Constr.prototype.createPlaylist = function(userId, options2, callback) {
        var requestData = {
          url: _baseUri + "/users/" + encodeURIComponent(userId) + "/playlists",
          type: "POST",
          postData: options2
        };
        return _checkParamsAndPerformRequest(requestData, options2, callback);
      };
      Constr.prototype.changePlaylistDetails = function(playlistId, data, callback) {
        var requestData = {
          url: _baseUri + "/playlists/" + playlistId,
          type: "PUT",
          postData: data
        };
        return _checkParamsAndPerformRequest(requestData, data, callback);
      };
      Constr.prototype.addTracksToPlaylist = function(playlistId, uris, options2, callback) {
        var requestData = {
          url: _baseUri + "/playlists/" + playlistId + "/tracks",
          type: "POST",
          postData: {
            uris
          }
        };
        return _checkParamsAndPerformRequest(requestData, options2, callback, true);
      };
      Constr.prototype.replaceTracksInPlaylist = function(playlistId, uris, callback) {
        var requestData = {
          url: _baseUri + "/playlists/" + playlistId + "/tracks",
          type: "PUT",
          postData: { uris }
        };
        return _checkParamsAndPerformRequest(requestData, {}, callback);
      };
      Constr.prototype.reorderTracksInPlaylist = function(playlistId, rangeStart, insertBefore, options2, callback) {
        var requestData = {
          url: _baseUri + "/playlists/" + playlistId + "/tracks",
          type: "PUT",
          postData: {
            range_start: rangeStart,
            insert_before: insertBefore
          }
        };
        return _checkParamsAndPerformRequest(requestData, options2, callback);
      };
      Constr.prototype.removeTracksFromPlaylist = function(playlistId, uris, callback) {
        var dataToBeSent = uris.map(function(uri) {
          if (typeof uri === "string") {
            return { uri };
          } else {
            return uri;
          }
        });
        var requestData = {
          url: _baseUri + "/playlists/" + playlistId + "/tracks",
          type: "DELETE",
          postData: { tracks: dataToBeSent }
        };
        return _checkParamsAndPerformRequest(requestData, {}, callback);
      };
      Constr.prototype.removeTracksFromPlaylistWithSnapshotId = function(playlistId, uris, snapshotId, callback) {
        var dataToBeSent = uris.map(function(uri) {
          if (typeof uri === "string") {
            return { uri };
          } else {
            return uri;
          }
        });
        var requestData = {
          url: _baseUri + "/playlists/" + playlistId + "/tracks",
          type: "DELETE",
          postData: {
            tracks: dataToBeSent,
            snapshot_id: snapshotId
          }
        };
        return _checkParamsAndPerformRequest(requestData, {}, callback);
      };
      Constr.prototype.removeTracksFromPlaylistInPositions = function(playlistId, positions, snapshotId, callback) {
        var requestData = {
          url: _baseUri + "/playlists/" + playlistId + "/tracks",
          type: "DELETE",
          postData: {
            positions,
            snapshot_id: snapshotId
          }
        };
        return _checkParamsAndPerformRequest(requestData, {}, callback);
      };
      Constr.prototype.uploadCustomPlaylistCoverImage = function(playlistId, imageData, callback) {
        var requestData = {
          url: _baseUri + "/playlists/" + playlistId + "/images",
          type: "PUT",
          postData: imageData.replace(/^data:image\/jpeg;base64,/, ""),
          contentType: "image/jpeg"
        };
        return _checkParamsAndPerformRequest(requestData, {}, callback);
      };
      Constr.prototype.getAlbum = function(albumId, options2, callback) {
        var requestData = {
          url: _baseUri + "/albums/" + albumId
        };
        return _checkParamsAndPerformRequest(requestData, options2, callback);
      };
      Constr.prototype.getAlbumTracks = function(albumId, options2, callback) {
        var requestData = {
          url: _baseUri + "/albums/" + albumId + "/tracks"
        };
        return _checkParamsAndPerformRequest(requestData, options2, callback);
      };
      Constr.prototype.getAlbums = function(albumIds, options2, callback) {
        var requestData = {
          url: _baseUri + "/albums/",
          params: { ids: albumIds.join(",") }
        };
        return _checkParamsAndPerformRequest(requestData, options2, callback);
      };
      Constr.prototype.getTrack = function(trackId, options2, callback) {
        var requestData = {};
        requestData.url = _baseUri + "/tracks/" + trackId;
        return _checkParamsAndPerformRequest(requestData, options2, callback);
      };
      Constr.prototype.getTracks = function(trackIds, options2, callback) {
        var requestData = {
          url: _baseUri + "/tracks/",
          params: { ids: trackIds.join(",") }
        };
        return _checkParamsAndPerformRequest(requestData, options2, callback);
      };
      Constr.prototype.getArtist = function(artistId, options2, callback) {
        var requestData = {
          url: _baseUri + "/artists/" + artistId
        };
        return _checkParamsAndPerformRequest(requestData, options2, callback);
      };
      Constr.prototype.getArtists = function(artistIds, options2, callback) {
        var requestData = {
          url: _baseUri + "/artists/",
          params: { ids: artistIds.join(",") }
        };
        return _checkParamsAndPerformRequest(requestData, options2, callback);
      };
      Constr.prototype.getArtistAlbums = function(artistId, options2, callback) {
        var requestData = {
          url: _baseUri + "/artists/" + artistId + "/albums"
        };
        return _checkParamsAndPerformRequest(requestData, options2, callback);
      };
      Constr.prototype.getArtistTopTracks = function(artistId, countryId, options2, callback) {
        var requestData = {
          url: _baseUri + "/artists/" + artistId + "/top-tracks",
          params: { country: countryId }
        };
        return _checkParamsAndPerformRequest(requestData, options2, callback);
      };
      Constr.prototype.getArtistRelatedArtists = function(artistId, options2, callback) {
        var requestData = {
          url: _baseUri + "/artists/" + artistId + "/related-artists"
        };
        return _checkParamsAndPerformRequest(requestData, options2, callback);
      };
      Constr.prototype.getFeaturedPlaylists = function(options2, callback) {
        var requestData = {
          url: _baseUri + "/browse/featured-playlists"
        };
        return _checkParamsAndPerformRequest(requestData, options2, callback);
      };
      Constr.prototype.getNewReleases = function(options2, callback) {
        var requestData = {
          url: _baseUri + "/browse/new-releases"
        };
        return _checkParamsAndPerformRequest(requestData, options2, callback);
      };
      Constr.prototype.getCategories = function(options2, callback) {
        var requestData = {
          url: _baseUri + "/browse/categories"
        };
        return _checkParamsAndPerformRequest(requestData, options2, callback);
      };
      Constr.prototype.getCategory = function(categoryId, options2, callback) {
        var requestData = {
          url: _baseUri + "/browse/categories/" + categoryId
        };
        return _checkParamsAndPerformRequest(requestData, options2, callback);
      };
      Constr.prototype.getCategoryPlaylists = function(categoryId, options2, callback) {
        var requestData = {
          url: _baseUri + "/browse/categories/" + categoryId + "/playlists"
        };
        return _checkParamsAndPerformRequest(requestData, options2, callback);
      };
      Constr.prototype.search = function(query, types2, options2, callback) {
        var requestData = {
          url: _baseUri + "/search/",
          params: {
            q: query,
            type: types2.join(",")
          }
        };
        return _checkParamsAndPerformRequest(requestData, options2, callback);
      };
      Constr.prototype.searchAlbums = function(query, options2, callback) {
        return this.search(query, ["album"], options2, callback);
      };
      Constr.prototype.searchArtists = function(query, options2, callback) {
        return this.search(query, ["artist"], options2, callback);
      };
      Constr.prototype.searchTracks = function(query, options2, callback) {
        return this.search(query, ["track"], options2, callback);
      };
      Constr.prototype.searchPlaylists = function(query, options2, callback) {
        return this.search(query, ["playlist"], options2, callback);
      };
      Constr.prototype.searchShows = function(query, options2, callback) {
        return this.search(query, ["show"], options2, callback);
      };
      Constr.prototype.searchEpisodes = function(query, options2, callback) {
        return this.search(query, ["episode"], options2, callback);
      };
      Constr.prototype.getAudioFeaturesForTrack = function(trackId, callback) {
        var requestData = {};
        requestData.url = _baseUri + "/audio-features/" + trackId;
        return _checkParamsAndPerformRequest(requestData, {}, callback);
      };
      Constr.prototype.getAudioFeaturesForTracks = function(trackIds, callback) {
        var requestData = {
          url: _baseUri + "/audio-features",
          params: { ids: trackIds }
        };
        return _checkParamsAndPerformRequest(requestData, {}, callback);
      };
      Constr.prototype.getAudioAnalysisForTrack = function(trackId, callback) {
        var requestData = {};
        requestData.url = _baseUri + "/audio-analysis/" + trackId;
        return _checkParamsAndPerformRequest(requestData, {}, callback);
      };
      Constr.prototype.getRecommendations = function(options2, callback) {
        var requestData = {
          url: _baseUri + "/recommendations"
        };
        return _checkParamsAndPerformRequest(requestData, options2, callback);
      };
      Constr.prototype.getAvailableGenreSeeds = function(callback) {
        var requestData = {
          url: _baseUri + "/recommendations/available-genre-seeds"
        };
        return _checkParamsAndPerformRequest(requestData, {}, callback);
      };
      Constr.prototype.getMyDevices = function(callback) {
        var requestData = {
          url: _baseUri + "/me/player/devices"
        };
        return _checkParamsAndPerformRequest(requestData, {}, callback);
      };
      Constr.prototype.getMyCurrentPlaybackState = function(options2, callback) {
        var requestData = {
          url: _baseUri + "/me/player"
        };
        return _checkParamsAndPerformRequest(requestData, options2, callback);
      };
      Constr.prototype.getMyCurrentPlayingTrack = function(options2, callback) {
        var requestData = {
          url: _baseUri + "/me/player/currently-playing"
        };
        return _checkParamsAndPerformRequest(requestData, options2, callback);
      };
      Constr.prototype.transferMyPlayback = function(deviceIds, options2, callback) {
        var postData = options2 || {};
        postData.device_ids = deviceIds;
        var requestData = {
          type: "PUT",
          url: _baseUri + "/me/player",
          postData
        };
        return _checkParamsAndPerformRequest(requestData, options2, callback);
      };
      Constr.prototype.play = function(options2, callback) {
        options2 = options2 || {};
        var params = "device_id" in options2 ? { device_id: options2.device_id } : null;
        var postData = {};
        ["context_uri", "uris", "offset", "position_ms"].forEach(function(field) {
          if (field in options2) {
            postData[field] = options2[field];
          }
        });
        var requestData = {
          type: "PUT",
          url: _baseUri + "/me/player/play",
          params,
          postData
        };
        var newOptions = typeof options2 === "function" ? options2 : {};
        return _checkParamsAndPerformRequest(requestData, newOptions, callback);
      };
      Constr.prototype.queue = function(uri, options2, callback) {
        options2 = options2 || {};
        var params = "device_id" in options2 ? { uri, device_id: options2.device_id } : { uri };
        var requestData = {
          type: "POST",
          url: _baseUri + "/me/player/queue",
          params
        };
        return _checkParamsAndPerformRequest(requestData, options2, callback);
      };
      Constr.prototype.pause = function(options2, callback) {
        options2 = options2 || {};
        var params = "device_id" in options2 ? { device_id: options2.device_id } : null;
        var requestData = {
          type: "PUT",
          url: _baseUri + "/me/player/pause",
          params
        };
        return _checkParamsAndPerformRequest(requestData, options2, callback);
      };
      Constr.prototype.skipToNext = function(options2, callback) {
        options2 = options2 || {};
        var params = "device_id" in options2 ? { device_id: options2.device_id } : null;
        var requestData = {
          type: "POST",
          url: _baseUri + "/me/player/next",
          params
        };
        return _checkParamsAndPerformRequest(requestData, options2, callback);
      };
      Constr.prototype.skipToPrevious = function(options2, callback) {
        options2 = options2 || {};
        var params = "device_id" in options2 ? { device_id: options2.device_id } : null;
        var requestData = {
          type: "POST",
          url: _baseUri + "/me/player/previous",
          params
        };
        return _checkParamsAndPerformRequest(requestData, options2, callback);
      };
      Constr.prototype.seek = function(position_ms, options2, callback) {
        options2 = options2 || {};
        var params = {
          position_ms
        };
        if ("device_id" in options2) {
          params.device_id = options2.device_id;
        }
        var requestData = {
          type: "PUT",
          url: _baseUri + "/me/player/seek",
          params
        };
        return _checkParamsAndPerformRequest(requestData, options2, callback);
      };
      Constr.prototype.setRepeat = function(state, options2, callback) {
        options2 = options2 || {};
        var params = {
          state
        };
        if ("device_id" in options2) {
          params.device_id = options2.device_id;
        }
        var requestData = {
          type: "PUT",
          url: _baseUri + "/me/player/repeat",
          params
        };
        return _checkParamsAndPerformRequest(requestData, options2, callback);
      };
      Constr.prototype.setVolume = function(volume_percent, options2, callback) {
        options2 = options2 || {};
        var params = {
          volume_percent
        };
        if ("device_id" in options2) {
          params.device_id = options2.device_id;
        }
        var requestData = {
          type: "PUT",
          url: _baseUri + "/me/player/volume",
          params
        };
        return _checkParamsAndPerformRequest(requestData, options2, callback);
      };
      Constr.prototype.setShuffle = function(state, options2, callback) {
        options2 = options2 || {};
        var params = {
          state
        };
        if ("device_id" in options2) {
          params.device_id = options2.device_id;
        }
        var requestData = {
          type: "PUT",
          url: _baseUri + "/me/player/shuffle",
          params
        };
        return _checkParamsAndPerformRequest(requestData, options2, callback);
      };
      Constr.prototype.getShow = function(showId, options2, callback) {
        var requestData = {};
        requestData.url = _baseUri + "/shows/" + showId;
        return _checkParamsAndPerformRequest(requestData, options2, callback);
      };
      Constr.prototype.getShows = function(showIds, options2, callback) {
        var requestData = {
          url: _baseUri + "/shows/",
          params: { ids: showIds.join(",") }
        };
        return _checkParamsAndPerformRequest(requestData, options2, callback);
      };
      Constr.prototype.getMySavedShows = function(options2, callback) {
        var requestData = {
          url: _baseUri + "/me/shows"
        };
        return _checkParamsAndPerformRequest(requestData, options2, callback);
      };
      Constr.prototype.addToMySavedShows = function(showIds, options2, callback) {
        var requestData = {
          url: _baseUri + "/me/shows",
          type: "PUT",
          postData: showIds
        };
        return _checkParamsAndPerformRequest(requestData, options2, callback);
      };
      Constr.prototype.removeFromMySavedShows = function(showIds, options2, callback) {
        var requestData = {
          url: _baseUri + "/me/shows",
          type: "DELETE",
          postData: showIds
        };
        return _checkParamsAndPerformRequest(requestData, options2, callback);
      };
      Constr.prototype.containsMySavedShows = function(showIds, options2, callback) {
        var requestData = {
          url: _baseUri + "/me/shows/contains",
          params: { ids: showIds.join(",") }
        };
        return _checkParamsAndPerformRequest(requestData, options2, callback);
      };
      Constr.prototype.getShowEpisodes = function(showId, options2, callback) {
        var requestData = {
          url: _baseUri + "/shows/" + showId + "/episodes"
        };
        return _checkParamsAndPerformRequest(requestData, options2, callback);
      };
      Constr.prototype.getEpisode = function(episodeId, options2, callback) {
        var requestData = {};
        requestData.url = _baseUri + "/episodes/" + episodeId;
        return _checkParamsAndPerformRequest(requestData, options2, callback);
      };
      Constr.prototype.getEpisodes = function(episodeIds, options2, callback) {
        var requestData = {
          url: _baseUri + "/episodes/",
          params: { ids: episodeIds.join(",") }
        };
        return _checkParamsAndPerformRequest(requestData, options2, callback);
      };
      Constr.prototype.getAccessToken = function() {
        return _accessToken;
      };
      Constr.prototype.setAccessToken = function(accessToken) {
        _accessToken = accessToken;
      };
      Constr.prototype.setPromiseImplementation = function(PromiseImplementation) {
        var valid = false;
        try {
          var p = new PromiseImplementation(function(resolve2) {
            resolve2();
          });
          if (typeof p.then === "function" && typeof p.catch === "function") {
            valid = true;
          }
        } catch (e) {
          console.error(e);
        }
        if (valid) {
          _promiseImplementation = PromiseImplementation;
        } else {
          throw new Error("Unsupported implementation of Promises/A+");
        }
      };
      return Constr;
    }();
    if (typeof module2 === "object" && typeof module2.exports === "object") {
      module2.exports = SpotifyWebApi2;
    }
  }
});

// .svelte-kit/netlify/entry.js
__export(exports, {
  handler: () => handler
});

// node_modules/@sveltejs/kit/dist/install-fetch.js
var import_http = __toModule(require("http"));
var import_https = __toModule(require("https"));
var import_zlib = __toModule(require("zlib"));
var import_stream = __toModule(require("stream"));
var import_util = __toModule(require("util"));
var import_crypto = __toModule(require("crypto"));
var import_url = __toModule(require("url"));
var { Readable } = import_stream.default;
var wm = new WeakMap();
async function* read(parts) {
  for (const part of parts) {
    if ("stream" in part) {
      yield* part.stream();
    } else {
      yield part;
    }
  }
}
var Blob2 = class {
  constructor(blobParts = [], options2 = {}) {
    let size = 0;
    const parts = blobParts.map((element) => {
      let buffer;
      if (element instanceof Buffer) {
        buffer = element;
      } else if (ArrayBuffer.isView(element)) {
        buffer = Buffer.from(element.buffer, element.byteOffset, element.byteLength);
      } else if (element instanceof ArrayBuffer) {
        buffer = Buffer.from(element);
      } else if (element instanceof Blob2) {
        buffer = element;
      } else {
        buffer = Buffer.from(typeof element === "string" ? element : String(element));
      }
      size += buffer.length || buffer.size || 0;
      return buffer;
    });
    const type = options2.type === void 0 ? "" : String(options2.type).toLowerCase();
    wm.set(this, {
      type: /[^\u0020-\u007E]/.test(type) ? "" : type,
      size,
      parts
    });
  }
  get size() {
    return wm.get(this).size;
  }
  get type() {
    return wm.get(this).type;
  }
  async text() {
    return Buffer.from(await this.arrayBuffer()).toString();
  }
  async arrayBuffer() {
    const data = new Uint8Array(this.size);
    let offset = 0;
    for await (const chunk of this.stream()) {
      data.set(chunk, offset);
      offset += chunk.length;
    }
    return data.buffer;
  }
  stream() {
    return Readable.from(read(wm.get(this).parts));
  }
  slice(start = 0, end = this.size, type = "") {
    const { size } = this;
    let relativeStart = start < 0 ? Math.max(size + start, 0) : Math.min(start, size);
    let relativeEnd = end < 0 ? Math.max(size + end, 0) : Math.min(end, size);
    const span = Math.max(relativeEnd - relativeStart, 0);
    const parts = wm.get(this).parts.values();
    const blobParts = [];
    let added = 0;
    for (const part of parts) {
      const size2 = ArrayBuffer.isView(part) ? part.byteLength : part.size;
      if (relativeStart && size2 <= relativeStart) {
        relativeStart -= size2;
        relativeEnd -= size2;
      } else {
        const chunk = part.slice(relativeStart, Math.min(size2, relativeEnd));
        blobParts.push(chunk);
        added += ArrayBuffer.isView(chunk) ? chunk.byteLength : chunk.size;
        relativeStart = 0;
        if (added >= span) {
          break;
        }
      }
    }
    const blob = new Blob2([], { type: String(type).toLowerCase() });
    Object.assign(wm.get(blob), { size: span, parts: blobParts });
    return blob;
  }
  get [Symbol.toStringTag]() {
    return "Blob";
  }
  static [Symbol.hasInstance](object) {
    return object && typeof object === "object" && typeof object.stream === "function" && object.stream.length === 0 && typeof object.constructor === "function" && /^(Blob|File)$/.test(object[Symbol.toStringTag]);
  }
};
Object.defineProperties(Blob2.prototype, {
  size: { enumerable: true },
  type: { enumerable: true },
  slice: { enumerable: true }
});
var fetchBlob = Blob2;
var FetchBaseError = class extends Error {
  constructor(message, type) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
    this.type = type;
  }
  get name() {
    return this.constructor.name;
  }
  get [Symbol.toStringTag]() {
    return this.constructor.name;
  }
};
var FetchError = class extends FetchBaseError {
  constructor(message, type, systemError) {
    super(message, type);
    if (systemError) {
      this.code = this.errno = systemError.code;
      this.erroredSysCall = systemError.syscall;
    }
  }
};
var NAME = Symbol.toStringTag;
var isURLSearchParameters = (object) => {
  return typeof object === "object" && typeof object.append === "function" && typeof object.delete === "function" && typeof object.get === "function" && typeof object.getAll === "function" && typeof object.has === "function" && typeof object.set === "function" && typeof object.sort === "function" && object[NAME] === "URLSearchParams";
};
var isBlob = (object) => {
  return typeof object === "object" && typeof object.arrayBuffer === "function" && typeof object.type === "string" && typeof object.stream === "function" && typeof object.constructor === "function" && /^(Blob|File)$/.test(object[NAME]);
};
function isFormData(object) {
  return typeof object === "object" && typeof object.append === "function" && typeof object.set === "function" && typeof object.get === "function" && typeof object.getAll === "function" && typeof object.delete === "function" && typeof object.keys === "function" && typeof object.values === "function" && typeof object.entries === "function" && typeof object.constructor === "function" && object[NAME] === "FormData";
}
var isAbortSignal = (object) => {
  return typeof object === "object" && object[NAME] === "AbortSignal";
};
var carriage = "\r\n";
var dashes = "-".repeat(2);
var carriageLength = Buffer.byteLength(carriage);
var getFooter = (boundary) => `${dashes}${boundary}${dashes}${carriage.repeat(2)}`;
function getHeader(boundary, name, field) {
  let header = "";
  header += `${dashes}${boundary}${carriage}`;
  header += `Content-Disposition: form-data; name="${name}"`;
  if (isBlob(field)) {
    header += `; filename="${field.name}"${carriage}`;
    header += `Content-Type: ${field.type || "application/octet-stream"}`;
  }
  return `${header}${carriage.repeat(2)}`;
}
var getBoundary = () => (0, import_crypto.randomBytes)(8).toString("hex");
async function* formDataIterator(form, boundary) {
  for (const [name, value] of form) {
    yield getHeader(boundary, name, value);
    if (isBlob(value)) {
      yield* value.stream();
    } else {
      yield value;
    }
    yield carriage;
  }
  yield getFooter(boundary);
}
var INTERNALS$2 = Symbol("Body internals");
var Body = class {
  constructor(body, {
    size = 0
  } = {}) {
    let boundary = null;
    if (body === null) {
      body = null;
    } else if (isURLSearchParameters(body)) {
      body = Buffer.from(body.toString());
    } else if (isBlob(body))
      ;
    else if (Buffer.isBuffer(body))
      ;
    else if (import_util.types.isAnyArrayBuffer(body)) {
      body = Buffer.from(body);
    } else if (ArrayBuffer.isView(body)) {
      body = Buffer.from(body.buffer, body.byteOffset, body.byteLength);
    } else if (body instanceof import_stream.default)
      ;
    else if (isFormData(body)) {
      boundary = `NodeFetchFormDataBoundary${getBoundary()}`;
      body = import_stream.default.Readable.from(formDataIterator(body, boundary));
    } else {
      body = Buffer.from(String(body));
    }
    this[INTERNALS$2] = {
      body,
      boundary,
      disturbed: false,
      error: null
    };
    this.size = size;
    if (body instanceof import_stream.default) {
      body.on("error", (err) => {
        const error3 = err instanceof FetchBaseError ? err : new FetchError(`Invalid response body while trying to fetch ${this.url}: ${err.message}`, "system", err);
        this[INTERNALS$2].error = error3;
      });
    }
  }
  get body() {
    return this[INTERNALS$2].body;
  }
  get bodyUsed() {
    return this[INTERNALS$2].disturbed;
  }
  async arrayBuffer() {
    const { buffer, byteOffset, byteLength } = await consumeBody(this);
    return buffer.slice(byteOffset, byteOffset + byteLength);
  }
  async blob() {
    const ct = this.headers && this.headers.get("content-type") || this[INTERNALS$2].body && this[INTERNALS$2].body.type || "";
    const buf = await this.buffer();
    return new fetchBlob([buf], {
      type: ct
    });
  }
  async json() {
    const buffer = await consumeBody(this);
    return JSON.parse(buffer.toString());
  }
  async text() {
    const buffer = await consumeBody(this);
    return buffer.toString();
  }
  buffer() {
    return consumeBody(this);
  }
};
Object.defineProperties(Body.prototype, {
  body: { enumerable: true },
  bodyUsed: { enumerable: true },
  arrayBuffer: { enumerable: true },
  blob: { enumerable: true },
  json: { enumerable: true },
  text: { enumerable: true }
});
async function consumeBody(data) {
  if (data[INTERNALS$2].disturbed) {
    throw new TypeError(`body used already for: ${data.url}`);
  }
  data[INTERNALS$2].disturbed = true;
  if (data[INTERNALS$2].error) {
    throw data[INTERNALS$2].error;
  }
  let { body } = data;
  if (body === null) {
    return Buffer.alloc(0);
  }
  if (isBlob(body)) {
    body = body.stream();
  }
  if (Buffer.isBuffer(body)) {
    return body;
  }
  if (!(body instanceof import_stream.default)) {
    return Buffer.alloc(0);
  }
  const accum = [];
  let accumBytes = 0;
  try {
    for await (const chunk of body) {
      if (data.size > 0 && accumBytes + chunk.length > data.size) {
        const err = new FetchError(`content size at ${data.url} over limit: ${data.size}`, "max-size");
        body.destroy(err);
        throw err;
      }
      accumBytes += chunk.length;
      accum.push(chunk);
    }
  } catch (error3) {
    if (error3 instanceof FetchBaseError) {
      throw error3;
    } else {
      throw new FetchError(`Invalid response body while trying to fetch ${data.url}: ${error3.message}`, "system", error3);
    }
  }
  if (body.readableEnded === true || body._readableState.ended === true) {
    try {
      if (accum.every((c) => typeof c === "string")) {
        return Buffer.from(accum.join(""));
      }
      return Buffer.concat(accum, accumBytes);
    } catch (error3) {
      throw new FetchError(`Could not create Buffer from response body for ${data.url}: ${error3.message}`, "system", error3);
    }
  } else {
    throw new FetchError(`Premature close of server response while trying to fetch ${data.url}`);
  }
}
var clone = (instance, highWaterMark) => {
  let p1;
  let p2;
  let { body } = instance;
  if (instance.bodyUsed) {
    throw new Error("cannot clone body after it is used");
  }
  if (body instanceof import_stream.default && typeof body.getBoundary !== "function") {
    p1 = new import_stream.PassThrough({ highWaterMark });
    p2 = new import_stream.PassThrough({ highWaterMark });
    body.pipe(p1);
    body.pipe(p2);
    instance[INTERNALS$2].body = p1;
    body = p2;
  }
  return body;
};
var extractContentType = (body, request) => {
  if (body === null) {
    return null;
  }
  if (typeof body === "string") {
    return "text/plain;charset=UTF-8";
  }
  if (isURLSearchParameters(body)) {
    return "application/x-www-form-urlencoded;charset=UTF-8";
  }
  if (isBlob(body)) {
    return body.type || null;
  }
  if (Buffer.isBuffer(body) || import_util.types.isAnyArrayBuffer(body) || ArrayBuffer.isView(body)) {
    return null;
  }
  if (body && typeof body.getBoundary === "function") {
    return `multipart/form-data;boundary=${body.getBoundary()}`;
  }
  if (isFormData(body)) {
    return `multipart/form-data; boundary=${request[INTERNALS$2].boundary}`;
  }
  if (body instanceof import_stream.default) {
    return null;
  }
  return "text/plain;charset=UTF-8";
};
var validateHeaderName = typeof import_http.default.validateHeaderName === "function" ? import_http.default.validateHeaderName : (name) => {
  if (!/^[\^`\-\w!#$%&'*+.|~]+$/.test(name)) {
    const err = new TypeError(`Header name must be a valid HTTP token [${name}]`);
    Object.defineProperty(err, "code", { value: "ERR_INVALID_HTTP_TOKEN" });
    throw err;
  }
};
var validateHeaderValue = typeof import_http.default.validateHeaderValue === "function" ? import_http.default.validateHeaderValue : (name, value) => {
  if (/[^\t\u0020-\u007E\u0080-\u00FF]/.test(value)) {
    const err = new TypeError(`Invalid character in header content ["${name}"]`);
    Object.defineProperty(err, "code", { value: "ERR_INVALID_CHAR" });
    throw err;
  }
};
var Headers = class extends URLSearchParams {
  constructor(init) {
    let result = [];
    if (init instanceof Headers) {
      const raw = init.raw();
      for (const [name, values] of Object.entries(raw)) {
        result.push(...values.map((value) => [name, value]));
      }
    } else if (init == null)
      ;
    else if (typeof init === "object" && !import_util.types.isBoxedPrimitive(init)) {
      const method = init[Symbol.iterator];
      if (method == null) {
        result.push(...Object.entries(init));
      } else {
        if (typeof method !== "function") {
          throw new TypeError("Header pairs must be iterable");
        }
        result = [...init].map((pair) => {
          if (typeof pair !== "object" || import_util.types.isBoxedPrimitive(pair)) {
            throw new TypeError("Each header pair must be an iterable object");
          }
          return [...pair];
        }).map((pair) => {
          if (pair.length !== 2) {
            throw new TypeError("Each header pair must be a name/value tuple");
          }
          return [...pair];
        });
      }
    } else {
      throw new TypeError("Failed to construct 'Headers': The provided value is not of type '(sequence<sequence<ByteString>> or record<ByteString, ByteString>)");
    }
    result = result.length > 0 ? result.map(([name, value]) => {
      validateHeaderName(name);
      validateHeaderValue(name, String(value));
      return [String(name).toLowerCase(), String(value)];
    }) : void 0;
    super(result);
    return new Proxy(this, {
      get(target, p, receiver) {
        switch (p) {
          case "append":
          case "set":
            return (name, value) => {
              validateHeaderName(name);
              validateHeaderValue(name, String(value));
              return URLSearchParams.prototype[p].call(receiver, String(name).toLowerCase(), String(value));
            };
          case "delete":
          case "has":
          case "getAll":
            return (name) => {
              validateHeaderName(name);
              return URLSearchParams.prototype[p].call(receiver, String(name).toLowerCase());
            };
          case "keys":
            return () => {
              target.sort();
              return new Set(URLSearchParams.prototype.keys.call(target)).keys();
            };
          default:
            return Reflect.get(target, p, receiver);
        }
      }
    });
  }
  get [Symbol.toStringTag]() {
    return this.constructor.name;
  }
  toString() {
    return Object.prototype.toString.call(this);
  }
  get(name) {
    const values = this.getAll(name);
    if (values.length === 0) {
      return null;
    }
    let value = values.join(", ");
    if (/^content-encoding$/i.test(name)) {
      value = value.toLowerCase();
    }
    return value;
  }
  forEach(callback) {
    for (const name of this.keys()) {
      callback(this.get(name), name);
    }
  }
  *values() {
    for (const name of this.keys()) {
      yield this.get(name);
    }
  }
  *entries() {
    for (const name of this.keys()) {
      yield [name, this.get(name)];
    }
  }
  [Symbol.iterator]() {
    return this.entries();
  }
  raw() {
    return [...this.keys()].reduce((result, key) => {
      result[key] = this.getAll(key);
      return result;
    }, {});
  }
  [Symbol.for("nodejs.util.inspect.custom")]() {
    return [...this.keys()].reduce((result, key) => {
      const values = this.getAll(key);
      if (key === "host") {
        result[key] = values[0];
      } else {
        result[key] = values.length > 1 ? values : values[0];
      }
      return result;
    }, {});
  }
};
Object.defineProperties(Headers.prototype, ["get", "entries", "forEach", "values"].reduce((result, property) => {
  result[property] = { enumerable: true };
  return result;
}, {}));
var redirectStatus = new Set([301, 302, 303, 307, 308]);
var isRedirect = (code) => {
  return redirectStatus.has(code);
};
var INTERNALS$1 = Symbol("Response internals");
var Response2 = class extends Body {
  constructor(body = null, options2 = {}) {
    super(body, options2);
    const status = options2.status || 200;
    const headers = new Headers(options2.headers);
    if (body !== null && !headers.has("Content-Type")) {
      const contentType = extractContentType(body);
      if (contentType) {
        headers.append("Content-Type", contentType);
      }
    }
    this[INTERNALS$1] = {
      url: options2.url,
      status,
      statusText: options2.statusText || "",
      headers,
      counter: options2.counter,
      highWaterMark: options2.highWaterMark
    };
  }
  get url() {
    return this[INTERNALS$1].url || "";
  }
  get status() {
    return this[INTERNALS$1].status;
  }
  get ok() {
    return this[INTERNALS$1].status >= 200 && this[INTERNALS$1].status < 300;
  }
  get redirected() {
    return this[INTERNALS$1].counter > 0;
  }
  get statusText() {
    return this[INTERNALS$1].statusText;
  }
  get headers() {
    return this[INTERNALS$1].headers;
  }
  get highWaterMark() {
    return this[INTERNALS$1].highWaterMark;
  }
  clone() {
    return new Response2(clone(this, this.highWaterMark), {
      url: this.url,
      status: this.status,
      statusText: this.statusText,
      headers: this.headers,
      ok: this.ok,
      redirected: this.redirected,
      size: this.size
    });
  }
  static redirect(url, status = 302) {
    if (!isRedirect(status)) {
      throw new RangeError('Failed to execute "redirect" on "response": Invalid status code');
    }
    return new Response2(null, {
      headers: {
        location: new URL(url).toString()
      },
      status
    });
  }
  get [Symbol.toStringTag]() {
    return "Response";
  }
};
Object.defineProperties(Response2.prototype, {
  url: { enumerable: true },
  status: { enumerable: true },
  ok: { enumerable: true },
  redirected: { enumerable: true },
  statusText: { enumerable: true },
  headers: { enumerable: true },
  clone: { enumerable: true }
});
var INTERNALS = Symbol("Request internals");
var isRequest = (object) => {
  return typeof object === "object" && typeof object[INTERNALS] === "object";
};
var Request2 = class extends Body {
  constructor(input, init = {}) {
    let parsedURL;
    if (isRequest(input)) {
      parsedURL = new URL(input.url);
    } else {
      parsedURL = new URL(input);
      input = {};
    }
    let method = init.method || input.method || "GET";
    method = method.toUpperCase();
    if ((init.body != null || isRequest(input)) && input.body !== null && (method === "GET" || method === "HEAD")) {
      throw new TypeError("Request with GET/HEAD method cannot have body");
    }
    const inputBody = init.body ? init.body : isRequest(input) && input.body !== null ? clone(input) : null;
    super(inputBody, {
      size: init.size || input.size || 0
    });
    const headers = new Headers(init.headers || input.headers || {});
    if (inputBody !== null && !headers.has("Content-Type")) {
      const contentType = extractContentType(inputBody, this);
      if (contentType) {
        headers.append("Content-Type", contentType);
      }
    }
    let signal = isRequest(input) ? input.signal : null;
    if ("signal" in init) {
      signal = init.signal;
    }
    if (signal !== null && !isAbortSignal(signal)) {
      throw new TypeError("Expected signal to be an instanceof AbortSignal");
    }
    this[INTERNALS] = {
      method,
      redirect: init.redirect || input.redirect || "follow",
      headers,
      parsedURL,
      signal
    };
    this.follow = init.follow === void 0 ? input.follow === void 0 ? 20 : input.follow : init.follow;
    this.compress = init.compress === void 0 ? input.compress === void 0 ? true : input.compress : init.compress;
    this.counter = init.counter || input.counter || 0;
    this.agent = init.agent || input.agent;
    this.highWaterMark = init.highWaterMark || input.highWaterMark || 16384;
    this.insecureHTTPParser = init.insecureHTTPParser || input.insecureHTTPParser || false;
  }
  get method() {
    return this[INTERNALS].method;
  }
  get url() {
    return (0, import_url.format)(this[INTERNALS].parsedURL);
  }
  get headers() {
    return this[INTERNALS].headers;
  }
  get redirect() {
    return this[INTERNALS].redirect;
  }
  get signal() {
    return this[INTERNALS].signal;
  }
  clone() {
    return new Request2(this);
  }
  get [Symbol.toStringTag]() {
    return "Request";
  }
};
Object.defineProperties(Request2.prototype, {
  method: { enumerable: true },
  url: { enumerable: true },
  headers: { enumerable: true },
  redirect: { enumerable: true },
  clone: { enumerable: true },
  signal: { enumerable: true }
});
var supportedSchemas = new Set(["data:", "http:", "https:"]);

// node_modules/@sveltejs/kit/dist/adapter-utils.js
function isContentTypeBinary(content_type) {
  return content_type.startsWith("image/") || content_type.startsWith("audio/") || content_type.startsWith("video/") || content_type.startsWith("application/octet-stream");
}

// node_modules/@sveltejs/kit/dist/ssr.js
var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$";
var unsafeChars = /[<>\b\f\n\r\t\0\u2028\u2029]/g;
var reserved = /^(?:do|if|in|for|int|let|new|try|var|byte|case|char|else|enum|goto|long|this|void|with|await|break|catch|class|const|final|float|short|super|throw|while|yield|delete|double|export|import|native|return|switch|throws|typeof|boolean|default|extends|finally|package|private|abstract|continue|debugger|function|volatile|interface|protected|transient|implements|instanceof|synchronized)$/;
var escaped$1 = {
  "<": "\\u003C",
  ">": "\\u003E",
  "/": "\\u002F",
  "\\": "\\\\",
  "\b": "\\b",
  "\f": "\\f",
  "\n": "\\n",
  "\r": "\\r",
  "	": "\\t",
  "\0": "\\0",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029"
};
var objectProtoOwnPropertyNames = Object.getOwnPropertyNames(Object.prototype).sort().join("\0");
function devalue(value) {
  var counts = new Map();
  function walk(thing) {
    if (typeof thing === "function") {
      throw new Error("Cannot stringify a function");
    }
    if (counts.has(thing)) {
      counts.set(thing, counts.get(thing) + 1);
      return;
    }
    counts.set(thing, 1);
    if (!isPrimitive(thing)) {
      var type = getType(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
        case "Date":
        case "RegExp":
          return;
        case "Array":
          thing.forEach(walk);
          break;
        case "Set":
        case "Map":
          Array.from(thing).forEach(walk);
          break;
        default:
          var proto = Object.getPrototypeOf(thing);
          if (proto !== Object.prototype && proto !== null && Object.getOwnPropertyNames(proto).sort().join("\0") !== objectProtoOwnPropertyNames) {
            throw new Error("Cannot stringify arbitrary non-POJOs");
          }
          if (Object.getOwnPropertySymbols(thing).length > 0) {
            throw new Error("Cannot stringify POJOs with symbolic keys");
          }
          Object.keys(thing).forEach(function(key) {
            return walk(thing[key]);
          });
      }
    }
  }
  walk(value);
  var names = new Map();
  Array.from(counts).filter(function(entry) {
    return entry[1] > 1;
  }).sort(function(a, b) {
    return b[1] - a[1];
  }).forEach(function(entry, i) {
    names.set(entry[0], getName(i));
  });
  function stringify(thing) {
    if (names.has(thing)) {
      return names.get(thing);
    }
    if (isPrimitive(thing)) {
      return stringifyPrimitive(thing);
    }
    var type = getType(thing);
    switch (type) {
      case "Number":
      case "String":
      case "Boolean":
        return "Object(" + stringify(thing.valueOf()) + ")";
      case "RegExp":
        return "new RegExp(" + stringifyString(thing.source) + ', "' + thing.flags + '")';
      case "Date":
        return "new Date(" + thing.getTime() + ")";
      case "Array":
        var members = thing.map(function(v, i) {
          return i in thing ? stringify(v) : "";
        });
        var tail = thing.length === 0 || thing.length - 1 in thing ? "" : ",";
        return "[" + members.join(",") + tail + "]";
      case "Set":
      case "Map":
        return "new " + type + "([" + Array.from(thing).map(stringify).join(",") + "])";
      default:
        var obj = "{" + Object.keys(thing).map(function(key) {
          return safeKey(key) + ":" + stringify(thing[key]);
        }).join(",") + "}";
        var proto = Object.getPrototypeOf(thing);
        if (proto === null) {
          return Object.keys(thing).length > 0 ? "Object.assign(Object.create(null)," + obj + ")" : "Object.create(null)";
        }
        return obj;
    }
  }
  var str = stringify(value);
  if (names.size) {
    var params_1 = [];
    var statements_1 = [];
    var values_1 = [];
    names.forEach(function(name, thing) {
      params_1.push(name);
      if (isPrimitive(thing)) {
        values_1.push(stringifyPrimitive(thing));
        return;
      }
      var type = getType(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
          values_1.push("Object(" + stringify(thing.valueOf()) + ")");
          break;
        case "RegExp":
          values_1.push(thing.toString());
          break;
        case "Date":
          values_1.push("new Date(" + thing.getTime() + ")");
          break;
        case "Array":
          values_1.push("Array(" + thing.length + ")");
          thing.forEach(function(v, i) {
            statements_1.push(name + "[" + i + "]=" + stringify(v));
          });
          break;
        case "Set":
          values_1.push("new Set");
          statements_1.push(name + "." + Array.from(thing).map(function(v) {
            return "add(" + stringify(v) + ")";
          }).join("."));
          break;
        case "Map":
          values_1.push("new Map");
          statements_1.push(name + "." + Array.from(thing).map(function(_a) {
            var k = _a[0], v = _a[1];
            return "set(" + stringify(k) + ", " + stringify(v) + ")";
          }).join("."));
          break;
        default:
          values_1.push(Object.getPrototypeOf(thing) === null ? "Object.create(null)" : "{}");
          Object.keys(thing).forEach(function(key) {
            statements_1.push("" + name + safeProp(key) + "=" + stringify(thing[key]));
          });
      }
    });
    statements_1.push("return " + str);
    return "(function(" + params_1.join(",") + "){" + statements_1.join(";") + "}(" + values_1.join(",") + "))";
  } else {
    return str;
  }
}
function getName(num) {
  var name = "";
  do {
    name = chars[num % chars.length] + name;
    num = ~~(num / chars.length) - 1;
  } while (num >= 0);
  return reserved.test(name) ? name + "_" : name;
}
function isPrimitive(thing) {
  return Object(thing) !== thing;
}
function stringifyPrimitive(thing) {
  if (typeof thing === "string")
    return stringifyString(thing);
  if (thing === void 0)
    return "void 0";
  if (thing === 0 && 1 / thing < 0)
    return "-0";
  var str = String(thing);
  if (typeof thing === "number")
    return str.replace(/^(-)?0\./, "$1.");
  return str;
}
function getType(thing) {
  return Object.prototype.toString.call(thing).slice(8, -1);
}
function escapeUnsafeChar(c) {
  return escaped$1[c] || c;
}
function escapeUnsafeChars(str) {
  return str.replace(unsafeChars, escapeUnsafeChar);
}
function safeKey(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? key : escapeUnsafeChars(JSON.stringify(key));
}
function safeProp(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? "." + key : "[" + escapeUnsafeChars(JSON.stringify(key)) + "]";
}
function stringifyString(str) {
  var result = '"';
  for (var i = 0; i < str.length; i += 1) {
    var char = str.charAt(i);
    var code = char.charCodeAt(0);
    if (char === '"') {
      result += '\\"';
    } else if (char in escaped$1) {
      result += escaped$1[char];
    } else if (code >= 55296 && code <= 57343) {
      var next = str.charCodeAt(i + 1);
      if (code <= 56319 && (next >= 56320 && next <= 57343)) {
        result += char + str[++i];
      } else {
        result += "\\u" + code.toString(16).toUpperCase();
      }
    } else {
      result += char;
    }
  }
  result += '"';
  return result;
}
function noop() {
}
function safe_not_equal(a, b) {
  return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
}
var subscriber_queue = [];
function writable(value, start = noop) {
  let stop;
  const subscribers = [];
  function set2(new_value) {
    if (safe_not_equal(value, new_value)) {
      value = new_value;
      if (stop) {
        const run_queue = !subscriber_queue.length;
        for (let i = 0; i < subscribers.length; i += 1) {
          const s2 = subscribers[i];
          s2[1]();
          subscriber_queue.push(s2, value);
        }
        if (run_queue) {
          for (let i = 0; i < subscriber_queue.length; i += 2) {
            subscriber_queue[i][0](subscriber_queue[i + 1]);
          }
          subscriber_queue.length = 0;
        }
      }
    }
  }
  function update2(fn) {
    set2(fn(value));
  }
  function subscribe(run2, invalidate = noop) {
    const subscriber = [run2, invalidate];
    subscribers.push(subscriber);
    if (subscribers.length === 1) {
      stop = start(set2) || noop;
    }
    run2(value);
    return () => {
      const index2 = subscribers.indexOf(subscriber);
      if (index2 !== -1) {
        subscribers.splice(index2, 1);
      }
      if (subscribers.length === 0) {
        stop();
        stop = null;
      }
    };
  }
  return { set: set2, update: update2, subscribe };
}
function hash(value) {
  let hash2 = 5381;
  let i = value.length;
  if (typeof value === "string") {
    while (i)
      hash2 = hash2 * 33 ^ value.charCodeAt(--i);
  } else {
    while (i)
      hash2 = hash2 * 33 ^ value[--i];
  }
  return (hash2 >>> 0).toString(36);
}
var s$1 = JSON.stringify;
async function render_response({
  options: options2,
  $session,
  page_config,
  status,
  error: error3,
  branch,
  page
}) {
  const css2 = new Set(options2.entry.css);
  const js = new Set(options2.entry.js);
  const styles = new Set();
  const serialized_data = [];
  let rendered;
  let is_private = false;
  let maxage;
  if (error3) {
    error3.stack = options2.get_stack(error3);
  }
  if (branch) {
    branch.forEach(({ node, loaded, fetched, uses_credentials }) => {
      if (node.css)
        node.css.forEach((url) => css2.add(url));
      if (node.js)
        node.js.forEach((url) => js.add(url));
      if (node.styles)
        node.styles.forEach((content) => styles.add(content));
      if (fetched && page_config.hydrate)
        serialized_data.push(...fetched);
      if (uses_credentials)
        is_private = true;
      maxage = loaded.maxage;
    });
    const session = writable($session);
    const props = {
      stores: {
        page: writable(null),
        navigating: writable(null),
        session
      },
      page,
      components: branch.map(({ node }) => node.module.default)
    };
    for (let i = 0; i < branch.length; i += 1) {
      props[`props_${i}`] = await branch[i].loaded.props;
    }
    let session_tracking_active = false;
    const unsubscribe = session.subscribe(() => {
      if (session_tracking_active)
        is_private = true;
    });
    session_tracking_active = true;
    try {
      rendered = options2.root.render(props);
    } finally {
      unsubscribe();
    }
  } else {
    rendered = { head: "", html: "", css: { code: "", map: null } };
  }
  const include_js = page_config.router || page_config.hydrate;
  if (!include_js)
    js.clear();
  const links = options2.amp ? styles.size > 0 || rendered.css.code.length > 0 ? `<style amp-custom>${Array.from(styles).concat(rendered.css.code).join("\n")}</style>` : "" : [
    ...Array.from(js).map((dep) => `<link rel="modulepreload" href="${dep}">`),
    ...Array.from(css2).map((dep) => `<link rel="stylesheet" href="${dep}">`)
  ].join("\n		");
  let init = "";
  if (options2.amp) {
    init = `
		<style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style>
		<noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
		<script async src="https://cdn.ampproject.org/v0.js"><\/script>`;
  } else if (include_js) {
    init = `<script type="module">
			import { start } from ${s$1(options2.entry.file)};
			start({
				target: ${options2.target ? `document.querySelector(${s$1(options2.target)})` : "document.body"},
				paths: ${s$1(options2.paths)},
				session: ${try_serialize($session, (error4) => {
      throw new Error(`Failed to serialize session data: ${error4.message}`);
    })},
				host: ${page && page.host ? s$1(page.host) : "location.host"},
				route: ${!!page_config.router},
				spa: ${!page_config.ssr},
				trailing_slash: ${s$1(options2.trailing_slash)},
				hydrate: ${page_config.ssr && page_config.hydrate ? `{
					status: ${status},
					error: ${serialize_error(error3)},
					nodes: [
						${branch.map(({ node }) => `import(${s$1(node.entry)})`).join(",\n						")}
					],
					page: {
						host: ${page.host ? s$1(page.host) : "location.host"}, // TODO this is redundant
						path: ${s$1(page.path)},
						query: new URLSearchParams(${s$1(page.query.toString())}),
						params: ${s$1(page.params)}
					}
				}` : "null"}
			});
		<\/script>`;
  }
  if (options2.service_worker) {
    init += `<script>
			if ('serviceWorker' in navigator) {
				navigator.serviceWorker.register('${options2.service_worker}');
			}
		<\/script>`;
  }
  const head = [
    rendered.head,
    styles.size && !options2.amp ? `<style data-svelte>${Array.from(styles).join("\n")}</style>` : "",
    links,
    init
  ].join("\n\n		");
  const body = options2.amp ? rendered.html : `${rendered.html}

			${serialized_data.map(({ url, body: body2, json }) => {
    let attributes = `type="application/json" data-type="svelte-data" data-url="${url}"`;
    if (body2)
      attributes += ` data-body="${hash(body2)}"`;
    return `<script ${attributes}>${json}<\/script>`;
  }).join("\n\n			")}
		`.replace(/^\t{2}/gm, "");
  const headers = {
    "content-type": "text/html"
  };
  if (maxage) {
    headers["cache-control"] = `${is_private ? "private" : "public"}, max-age=${maxage}`;
  }
  if (!options2.floc) {
    headers["permissions-policy"] = "interest-cohort=()";
  }
  return {
    status,
    headers,
    body: options2.template({ head, body })
  };
}
function try_serialize(data, fail) {
  try {
    return devalue(data);
  } catch (err) {
    if (fail)
      fail(err);
    return null;
  }
}
function serialize_error(error3) {
  if (!error3)
    return null;
  let serialized = try_serialize(error3);
  if (!serialized) {
    const { name, message, stack } = error3;
    serialized = try_serialize({ ...error3, name, message, stack });
  }
  if (!serialized) {
    serialized = "{}";
  }
  return serialized;
}
function normalize(loaded) {
  if (loaded.error) {
    const error3 = typeof loaded.error === "string" ? new Error(loaded.error) : loaded.error;
    const status = loaded.status;
    if (!(error3 instanceof Error)) {
      return {
        status: 500,
        error: new Error(`"error" property returned from load() must be a string or instance of Error, received type "${typeof error3}"`)
      };
    }
    if (!status || status < 400 || status > 599) {
      console.warn('"error" returned from load() without a valid status code \u2014 defaulting to 500');
      return { status: 500, error: error3 };
    }
    return { status, error: error3 };
  }
  if (loaded.redirect) {
    if (!loaded.status || Math.floor(loaded.status / 100) !== 3) {
      return {
        status: 500,
        error: new Error('"redirect" property returned from load() must be accompanied by a 3xx status code')
      };
    }
    if (typeof loaded.redirect !== "string") {
      return {
        status: 500,
        error: new Error('"redirect" property returned from load() must be a string')
      };
    }
  }
  return loaded;
}
function resolve(base, path) {
  const baseparts = path[0] === "/" ? [] : base.slice(1).split("/");
  const pathparts = path[0] === "/" ? path.slice(1).split("/") : path.split("/");
  baseparts.pop();
  for (let i = 0; i < pathparts.length; i += 1) {
    const part = pathparts[i];
    if (part === ".")
      continue;
    else if (part === "..")
      baseparts.pop();
    else
      baseparts.push(part);
  }
  return `/${baseparts.join("/")}`;
}
var s = JSON.stringify;
async function load_node({
  request,
  options: options2,
  state,
  route,
  page,
  node,
  $session,
  context,
  is_leaf,
  is_error,
  status,
  error: error3
}) {
  const { module: module2 } = node;
  let uses_credentials = false;
  const fetched = [];
  let loaded;
  if (module2.load) {
    const load_input = {
      page,
      get session() {
        uses_credentials = true;
        return $session;
      },
      fetch: async (resource, opts = {}) => {
        let url;
        if (typeof resource === "string") {
          url = resource;
        } else {
          url = resource.url;
          opts = {
            method: resource.method,
            headers: resource.headers,
            body: resource.body,
            mode: resource.mode,
            credentials: resource.credentials,
            cache: resource.cache,
            redirect: resource.redirect,
            referrer: resource.referrer,
            integrity: resource.integrity,
            ...opts
          };
        }
        if (options2.read && url.startsWith(options2.paths.assets)) {
          url = url.replace(options2.paths.assets, "");
        }
        if (url.startsWith("//")) {
          throw new Error(`Cannot request protocol-relative URL (${url}) in server-side fetch`);
        }
        let response;
        if (/^[a-zA-Z]+:/.test(url)) {
          const request2 = new Request(url, opts);
          response = await options2.hooks.serverFetch.call(null, request2);
        } else {
          const [path, search] = url.split("?");
          const resolved = resolve(request.path, path);
          const filename = resolved.slice(1);
          const filename_html = `${filename}/index.html`;
          const asset = options2.manifest.assets.find((d) => d.file === filename || d.file === filename_html);
          if (asset) {
            if (options2.read) {
              response = new Response(options2.read(asset.file), {
                headers: {
                  "content-type": asset.type
                }
              });
            } else {
              response = await fetch(`http://${page.host}/${asset.file}`, opts);
            }
          }
          if (!response) {
            const headers = { ...opts.headers };
            if (opts.credentials !== "omit") {
              uses_credentials = true;
              headers.cookie = request.headers.cookie;
              if (!headers.authorization) {
                headers.authorization = request.headers.authorization;
              }
            }
            if (opts.body && typeof opts.body !== "string") {
              throw new Error("Request body must be a string");
            }
            const rendered = await respond({
              host: request.host,
              method: opts.method || "GET",
              headers,
              path: resolved,
              rawBody: opts.body,
              query: new URLSearchParams(search)
            }, options2, {
              fetched: url,
              initiator: route
            });
            if (rendered) {
              if (state.prerender) {
                state.prerender.dependencies.set(resolved, rendered);
              }
              response = new Response(rendered.body, {
                status: rendered.status,
                headers: rendered.headers
              });
            }
          }
        }
        if (response) {
          const proxy = new Proxy(response, {
            get(response2, key, receiver) {
              async function text() {
                const body = await response2.text();
                const headers = {};
                for (const [key2, value] of response2.headers) {
                  if (key2 !== "etag" && key2 !== "set-cookie")
                    headers[key2] = value;
                }
                if (!opts.body || typeof opts.body === "string") {
                  fetched.push({
                    url,
                    body: opts.body,
                    json: `{"status":${response2.status},"statusText":${s(response2.statusText)},"headers":${s(headers)},"body":${escape(body)}}`
                  });
                }
                return body;
              }
              if (key === "text") {
                return text;
              }
              if (key === "json") {
                return async () => {
                  return JSON.parse(await text());
                };
              }
              return Reflect.get(response2, key, response2);
            }
          });
          return proxy;
        }
        return response || new Response("Not found", {
          status: 404
        });
      },
      context: { ...context }
    };
    if (is_error) {
      load_input.status = status;
      load_input.error = error3;
    }
    loaded = await module2.load.call(null, load_input);
  } else {
    loaded = {};
  }
  if (!loaded && is_leaf && !is_error)
    return;
  return {
    node,
    loaded: normalize(loaded),
    context: loaded.context || context,
    fetched,
    uses_credentials
  };
}
var escaped = {
  "<": "\\u003C",
  ">": "\\u003E",
  "/": "\\u002F",
  "\\": "\\\\",
  "\b": "\\b",
  "\f": "\\f",
  "\n": "\\n",
  "\r": "\\r",
  "	": "\\t",
  "\0": "\\0",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029"
};
function escape(str) {
  let result = '"';
  for (let i = 0; i < str.length; i += 1) {
    const char = str.charAt(i);
    const code = char.charCodeAt(0);
    if (char === '"') {
      result += '\\"';
    } else if (char in escaped) {
      result += escaped[char];
    } else if (code >= 55296 && code <= 57343) {
      const next = str.charCodeAt(i + 1);
      if (code <= 56319 && next >= 56320 && next <= 57343) {
        result += char + str[++i];
      } else {
        result += `\\u${code.toString(16).toUpperCase()}`;
      }
    } else {
      result += char;
    }
  }
  result += '"';
  return result;
}
async function respond_with_error({ request, options: options2, state, $session, status, error: error3 }) {
  const default_layout = await options2.load_component(options2.manifest.layout);
  const default_error = await options2.load_component(options2.manifest.error);
  const page = {
    host: request.host,
    path: request.path,
    query: request.query,
    params: {}
  };
  const loaded = await load_node({
    request,
    options: options2,
    state,
    route: null,
    page,
    node: default_layout,
    $session,
    context: {},
    is_leaf: false,
    is_error: false
  });
  const branch = [
    loaded,
    await load_node({
      request,
      options: options2,
      state,
      route: null,
      page,
      node: default_error,
      $session,
      context: loaded.context,
      is_leaf: false,
      is_error: true,
      status,
      error: error3
    })
  ];
  try {
    return await render_response({
      options: options2,
      $session,
      page_config: {
        hydrate: options2.hydrate,
        router: options2.router,
        ssr: options2.ssr
      },
      status,
      error: error3,
      branch,
      page
    });
  } catch (error4) {
    options2.handle_error(error4);
    return {
      status: 500,
      headers: {},
      body: error4.stack
    };
  }
}
async function respond$1({ request, options: options2, state, $session, route }) {
  const match = route.pattern.exec(request.path);
  const params = route.params(match);
  const page = {
    host: request.host,
    path: request.path,
    query: request.query,
    params
  };
  let nodes;
  try {
    nodes = await Promise.all(route.a.map((id) => id && options2.load_component(id)));
  } catch (error4) {
    options2.handle_error(error4);
    return await respond_with_error({
      request,
      options: options2,
      state,
      $session,
      status: 500,
      error: error4
    });
  }
  const leaf = nodes[nodes.length - 1].module;
  const page_config = {
    ssr: "ssr" in leaf ? leaf.ssr : options2.ssr,
    router: "router" in leaf ? leaf.router : options2.router,
    hydrate: "hydrate" in leaf ? leaf.hydrate : options2.hydrate
  };
  if (!leaf.prerender && state.prerender && !state.prerender.all) {
    return {
      status: 204,
      headers: {},
      body: null
    };
  }
  let branch;
  let status = 200;
  let error3;
  ssr:
    if (page_config.ssr) {
      let context = {};
      branch = [];
      for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        let loaded;
        if (node) {
          try {
            loaded = await load_node({
              request,
              options: options2,
              state,
              route,
              page,
              node,
              $session,
              context,
              is_leaf: i === nodes.length - 1,
              is_error: false
            });
            if (!loaded)
              return;
            if (loaded.loaded.redirect) {
              return {
                status: loaded.loaded.status,
                headers: {
                  location: encodeURI(loaded.loaded.redirect)
                }
              };
            }
            if (loaded.loaded.error) {
              ({ status, error: error3 } = loaded.loaded);
            }
          } catch (e) {
            options2.handle_error(e);
            status = 500;
            error3 = e;
          }
          if (error3) {
            while (i--) {
              if (route.b[i]) {
                const error_node = await options2.load_component(route.b[i]);
                let error_loaded;
                let node_loaded;
                let j = i;
                while (!(node_loaded = branch[j])) {
                  j -= 1;
                }
                try {
                  error_loaded = await load_node({
                    request,
                    options: options2,
                    state,
                    route,
                    page,
                    node: error_node,
                    $session,
                    context: node_loaded.context,
                    is_leaf: false,
                    is_error: true,
                    status,
                    error: error3
                  });
                  if (error_loaded.loaded.error) {
                    continue;
                  }
                  branch = branch.slice(0, j + 1).concat(error_loaded);
                  break ssr;
                } catch (e) {
                  options2.handle_error(e);
                  continue;
                }
              }
            }
            return await respond_with_error({
              request,
              options: options2,
              state,
              $session,
              status,
              error: error3
            });
          }
        }
        branch.push(loaded);
        if (loaded && loaded.loaded.context) {
          context = {
            ...context,
            ...loaded.loaded.context
          };
        }
      }
    }
  try {
    return await render_response({
      options: options2,
      $session,
      page_config,
      status,
      error: error3,
      branch: branch && branch.filter(Boolean),
      page
    });
  } catch (error4) {
    options2.handle_error(error4);
    return await respond_with_error({
      request,
      options: options2,
      state,
      $session,
      status: 500,
      error: error4
    });
  }
}
async function render_page(request, route, options2, state) {
  if (state.initiator === route) {
    return {
      status: 404,
      headers: {},
      body: `Not found: ${request.path}`
    };
  }
  const $session = await options2.hooks.getSession(request);
  if (route) {
    const response = await respond$1({
      request,
      options: options2,
      state,
      $session,
      route
    });
    if (response) {
      return response;
    }
    if (state.fetched) {
      return {
        status: 500,
        headers: {},
        body: `Bad request in load function: failed to fetch ${state.fetched}`
      };
    }
  } else {
    return await respond_with_error({
      request,
      options: options2,
      state,
      $session,
      status: 404,
      error: new Error(`Not found: ${request.path}`)
    });
  }
}
function lowercase_keys(obj) {
  const clone2 = {};
  for (const key in obj) {
    clone2[key.toLowerCase()] = obj[key];
  }
  return clone2;
}
function error(body) {
  return {
    status: 500,
    body,
    headers: {}
  };
}
async function render_route(request, route) {
  const mod = await route.load();
  const handler2 = mod[request.method.toLowerCase().replace("delete", "del")];
  if (handler2) {
    const match = route.pattern.exec(request.path);
    const params = route.params(match);
    const response = await handler2({ ...request, params });
    const preface = `Invalid response from route ${request.path}`;
    if (response) {
      if (typeof response !== "object") {
        return error(`${preface}: expected an object, got ${typeof response}`);
      }
      let { status = 200, body, headers = {} } = response;
      headers = lowercase_keys(headers);
      const type = headers["content-type"];
      const is_type_binary = type && isContentTypeBinary(type);
      if (is_type_binary && !(body instanceof Uint8Array)) {
        return error(`${preface}: body must be an instance of Uint8Array if content type is image/*, audio/*, video/* or application/octet-stream`);
      }
      if (body instanceof Uint8Array && !is_type_binary) {
        return error(`${preface}: Uint8Array body must have content-type header of image/*, audio/*, video/* or application/octet-stream`);
      }
      let normalized_body;
      if ((typeof body === "object" || typeof body === "undefined") && !(body instanceof Uint8Array) && (!type || type.startsWith("application/json"))) {
        headers = { ...headers, "content-type": "application/json; charset=utf-8" };
        normalized_body = JSON.stringify(body || {});
      } else {
        normalized_body = body;
      }
      return { status, body: normalized_body, headers };
    }
  }
}
function read_only_form_data() {
  const map = new Map();
  return {
    append(key, value) {
      if (map.has(key)) {
        map.get(key).push(value);
      } else {
        map.set(key, [value]);
      }
    },
    data: new ReadOnlyFormData(map)
  };
}
var ReadOnlyFormData = class {
  #map;
  constructor(map) {
    this.#map = map;
  }
  get(key) {
    const value = this.#map.get(key);
    return value && value[0];
  }
  getAll(key) {
    return this.#map.get(key);
  }
  has(key) {
    return this.#map.has(key);
  }
  *[Symbol.iterator]() {
    for (const [key, value] of this.#map) {
      for (let i = 0; i < value.length; i += 1) {
        yield [key, value[i]];
      }
    }
  }
  *entries() {
    for (const [key, value] of this.#map) {
      for (let i = 0; i < value.length; i += 1) {
        yield [key, value[i]];
      }
    }
  }
  *keys() {
    for (const [key] of this.#map)
      yield key;
  }
  *values() {
    for (const [, value] of this.#map) {
      for (let i = 0; i < value.length; i += 1) {
        yield value[i];
      }
    }
  }
};
function parse_body(raw, headers) {
  if (!raw)
    return raw;
  const [type, ...directives] = headers["content-type"].split(/;\s*/);
  if (typeof raw === "string") {
    switch (type) {
      case "text/plain":
        return raw;
      case "application/json":
        return JSON.parse(raw);
      case "application/x-www-form-urlencoded":
        return get_urlencoded(raw);
      case "multipart/form-data": {
        const boundary = directives.find((directive) => directive.startsWith("boundary="));
        if (!boundary)
          throw new Error("Missing boundary");
        return get_multipart(raw, boundary.slice("boundary=".length));
      }
      default:
        throw new Error(`Invalid Content-Type ${type}`);
    }
  }
  return raw;
}
function get_urlencoded(text) {
  const { data, append } = read_only_form_data();
  text.replace(/\+/g, " ").split("&").forEach((str) => {
    const [key, value] = str.split("=");
    append(decodeURIComponent(key), decodeURIComponent(value));
  });
  return data;
}
function get_multipart(text, boundary) {
  const parts = text.split(`--${boundary}`);
  const nope = () => {
    throw new Error("Malformed form data");
  };
  if (parts[0] !== "" || parts[parts.length - 1].trim() !== "--") {
    nope();
  }
  const { data, append } = read_only_form_data();
  parts.slice(1, -1).forEach((part) => {
    const match = /\s*([\s\S]+?)\r\n\r\n([\s\S]*)\s*/.exec(part);
    const raw_headers = match[1];
    const body = match[2].trim();
    let key;
    raw_headers.split("\r\n").forEach((str) => {
      const [raw_header, ...raw_directives] = str.split("; ");
      let [name, value] = raw_header.split(": ");
      name = name.toLowerCase();
      const directives = {};
      raw_directives.forEach((raw_directive) => {
        const [name2, value2] = raw_directive.split("=");
        directives[name2] = JSON.parse(value2);
      });
      if (name === "content-disposition") {
        if (value !== "form-data")
          nope();
        if (directives.filename) {
          throw new Error("File upload is not yet implemented");
        }
        if (directives.name) {
          key = directives.name;
        }
      }
    });
    if (!key)
      nope();
    append(key, body);
  });
  return data;
}
async function respond(incoming, options2, state = {}) {
  if (incoming.path !== "/" && options2.trailing_slash !== "ignore") {
    const has_trailing_slash = incoming.path.endsWith("/");
    if (has_trailing_slash && options2.trailing_slash === "never" || !has_trailing_slash && options2.trailing_slash === "always" && !incoming.path.split("/").pop().includes(".")) {
      const path = has_trailing_slash ? incoming.path.slice(0, -1) : incoming.path + "/";
      const q = incoming.query.toString();
      return {
        status: 301,
        headers: {
          location: encodeURI(path + (q ? `?${q}` : ""))
        }
      };
    }
  }
  try {
    const headers = lowercase_keys(incoming.headers);
    return await options2.hooks.handle({
      request: {
        ...incoming,
        headers,
        body: parse_body(incoming.rawBody, headers),
        params: null,
        locals: {}
      },
      resolve: async (request) => {
        if (state.prerender && state.prerender.fallback) {
          return await render_response({
            options: options2,
            $session: await options2.hooks.getSession(request),
            page_config: { ssr: false, router: true, hydrate: true },
            status: 200,
            error: null,
            branch: [],
            page: null
          });
        }
        for (const route of options2.manifest.routes) {
          if (!route.pattern.test(request.path))
            continue;
          const response = route.type === "endpoint" ? await render_route(request, route) : await render_page(request, route, options2, state);
          if (response) {
            if (response.status === 200) {
              if (!/(no-store|immutable)/.test(response.headers["cache-control"])) {
                const etag = `"${hash(response.body)}"`;
                if (request.headers["if-none-match"] === etag) {
                  return {
                    status: 304,
                    headers: {},
                    body: null
                  };
                }
                response.headers["etag"] = etag;
              }
            }
            return response;
          }
        }
        return await render_page(request, null, options2, state);
      }
    });
  } catch (e) {
    options2.handle_error(e);
    return {
      status: 500,
      headers: {},
      body: options2.dev ? e.stack : e.message
    };
  }
}

// .svelte-kit/output/server/app.js
var import_spotify_web_api_js = __toModule(require_spotify_web_api());
var __defProp2 = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
function run(fn) {
  return fn();
}
function blank_object() {
  return Object.create(null);
}
function run_all(fns) {
  fns.forEach(run);
}
function custom_event(type, detail) {
  const e = document.createEvent("CustomEvent");
  e.initCustomEvent(type, false, false, detail);
  return e;
}
var current_component;
function set_current_component(component) {
  current_component = component;
}
function get_current_component() {
  if (!current_component)
    throw new Error("Function called outside component initialization");
  return current_component;
}
function onMount(fn) {
  get_current_component().$$.on_mount.push(fn);
}
function afterUpdate(fn) {
  get_current_component().$$.after_update.push(fn);
}
function createEventDispatcher() {
  const component = get_current_component();
  return (type, detail) => {
    const callbacks = component.$$.callbacks[type];
    if (callbacks) {
      const event = custom_event(type, detail);
      callbacks.slice().forEach((fn) => {
        fn.call(component, event);
      });
    }
  };
}
function setContext(key, context) {
  get_current_component().$$.context.set(key, context);
}
var dirty_components = [];
var binding_callbacks = [];
var render_callbacks = [];
var flush_callbacks = [];
var resolved_promise = Promise.resolve();
var update_scheduled = false;
function schedule_update() {
  if (!update_scheduled) {
    update_scheduled = true;
    resolved_promise.then(flush);
  }
}
function tick() {
  schedule_update();
  return resolved_promise;
}
function add_render_callback(fn) {
  render_callbacks.push(fn);
}
var flushing = false;
var seen_callbacks = new Set();
function flush() {
  if (flushing)
    return;
  flushing = true;
  do {
    for (let i = 0; i < dirty_components.length; i += 1) {
      const component = dirty_components[i];
      set_current_component(component);
      update(component.$$);
    }
    set_current_component(null);
    dirty_components.length = 0;
    while (binding_callbacks.length)
      binding_callbacks.pop()();
    for (let i = 0; i < render_callbacks.length; i += 1) {
      const callback = render_callbacks[i];
      if (!seen_callbacks.has(callback)) {
        seen_callbacks.add(callback);
        callback();
      }
    }
    render_callbacks.length = 0;
  } while (dirty_components.length);
  while (flush_callbacks.length) {
    flush_callbacks.pop()();
  }
  update_scheduled = false;
  flushing = false;
  seen_callbacks.clear();
}
function update($$) {
  if ($$.fragment !== null) {
    $$.update();
    run_all($$.before_update);
    const dirty = $$.dirty;
    $$.dirty = [-1];
    $$.fragment && $$.fragment.p($$.ctx, dirty);
    $$.after_update.forEach(add_render_callback);
  }
}
var escaped2 = {
  '"': "&quot;",
  "'": "&#39;",
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;"
};
function escape2(html) {
  return String(html).replace(/["'&<>]/g, (match) => escaped2[match]);
}
var missing_component = {
  $$render: () => ""
};
function validate_component(component, name) {
  if (!component || !component.$$render) {
    if (name === "svelte:component")
      name += " this={...}";
    throw new Error(`<${name}> is not a valid SSR component. You may need to review your build config to ensure that dependencies are compiled, rather than imported as pre-compiled modules`);
  }
  return component;
}
var on_destroy;
function create_ssr_component(fn) {
  function $$render(result, props, bindings, slots, context) {
    const parent_component = current_component;
    const $$ = {
      on_destroy,
      context: new Map(parent_component ? parent_component.$$.context : context || []),
      on_mount: [],
      before_update: [],
      after_update: [],
      callbacks: blank_object()
    };
    set_current_component({ $$ });
    const html = fn(result, props, bindings, slots);
    set_current_component(parent_component);
    return html;
  }
  return {
    render: (props = {}, { $$slots = {}, context = new Map() } = {}) => {
      on_destroy = [];
      const result = { title: "", head: "", css: new Set() };
      const html = $$render(result, props, {}, $$slots, context);
      run_all(on_destroy);
      return {
        html,
        css: {
          code: Array.from(result.css).map((css2) => css2.code).join("\n"),
          map: null
        },
        head: result.title + result.head
      };
    },
    $$render
  };
}
function add_attribute(name, value, boolean) {
  if (value == null || boolean && !value)
    return "";
  return ` ${name}${value === true ? "" : `=${typeof value === "string" ? JSON.stringify(escape2(value)) : `"${value}"`}`}`;
}
var css$6 = {
  code: "#svelte-announcer.svelte-1j55zn5{position:absolute;left:0;top:0;clip:rect(0 0 0 0);clip-path:inset(50%);overflow:hidden;white-space:nowrap;width:1px;height:1px}",
  map: `{"version":3,"file":"root.svelte","sources":["root.svelte"],"sourcesContent":["<!-- This file is generated by @sveltejs/kit \u2014 do not edit it! -->\\n<script>\\n\\timport { setContext, afterUpdate, onMount } from 'svelte';\\n\\n\\t// stores\\n\\texport let stores;\\n\\texport let page;\\n\\n\\texport let components;\\n\\texport let props_0 = null;\\n\\texport let props_1 = null;\\n\\texport let props_2 = null;\\n\\n\\tsetContext('__svelte__', stores);\\n\\n\\t$: stores.page.set(page);\\n\\tafterUpdate(stores.page.notify);\\n\\n\\tlet mounted = false;\\n\\tlet navigated = false;\\n\\tlet title = null;\\n\\n\\tonMount(() => {\\n\\t\\tconst unsubscribe = stores.page.subscribe(() => {\\n\\t\\t\\tif (mounted) {\\n\\t\\t\\t\\tnavigated = true;\\n\\t\\t\\t\\ttitle = document.title || 'untitled page';\\n\\t\\t\\t}\\n\\t\\t});\\n\\n\\t\\tmounted = true;\\n\\t\\treturn unsubscribe;\\n\\t});\\n<\/script>\\n\\n<svelte:component this={components[0]} {...(props_0 || {})}>\\n\\t{#if components[1]}\\n\\t\\t<svelte:component this={components[1]} {...(props_1 || {})}>\\n\\t\\t\\t{#if components[2]}\\n\\t\\t\\t\\t<svelte:component this={components[2]} {...(props_2 || {})}/>\\n\\t\\t\\t{/if}\\n\\t\\t</svelte:component>\\n\\t{/if}\\n</svelte:component>\\n\\n{#if mounted}\\n\\t<div id=\\"svelte-announcer\\" aria-live=\\"assertive\\" aria-atomic=\\"true\\">\\n\\t\\t{#if navigated}\\n\\t\\t\\t{title}\\n\\t\\t{/if}\\n\\t</div>\\n{/if}\\n\\n<style>\\n\\t#svelte-announcer {\\n\\t\\tposition: absolute;\\n\\t\\tleft: 0;\\n\\t\\ttop: 0;\\n\\t\\tclip: rect(0 0 0 0);\\n\\t\\tclip-path: inset(50%);\\n\\t\\toverflow: hidden;\\n\\t\\twhite-space: nowrap;\\n\\t\\twidth: 1px;\\n\\t\\theight: 1px;\\n\\t}\\n</style>"],"names":[],"mappings":"AAsDC,iBAAiB,eAAC,CAAC,AAClB,QAAQ,CAAE,QAAQ,CAClB,IAAI,CAAE,CAAC,CACP,GAAG,CAAE,CAAC,CACN,IAAI,CAAE,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CACnB,SAAS,CAAE,MAAM,GAAG,CAAC,CACrB,QAAQ,CAAE,MAAM,CAChB,WAAW,CAAE,MAAM,CACnB,KAAK,CAAE,GAAG,CACV,MAAM,CAAE,GAAG,AACZ,CAAC"}`
};
var Root = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { stores } = $$props;
  let { page } = $$props;
  let { components } = $$props;
  let { props_0 = null } = $$props;
  let { props_1 = null } = $$props;
  let { props_2 = null } = $$props;
  setContext("__svelte__", stores);
  afterUpdate(stores.page.notify);
  let mounted = false;
  let navigated = false;
  let title = null;
  onMount(() => {
    const unsubscribe = stores.page.subscribe(() => {
      if (mounted) {
        navigated = true;
        title = document.title || "untitled page";
      }
    });
    mounted = true;
    return unsubscribe;
  });
  if ($$props.stores === void 0 && $$bindings.stores && stores !== void 0)
    $$bindings.stores(stores);
  if ($$props.page === void 0 && $$bindings.page && page !== void 0)
    $$bindings.page(page);
  if ($$props.components === void 0 && $$bindings.components && components !== void 0)
    $$bindings.components(components);
  if ($$props.props_0 === void 0 && $$bindings.props_0 && props_0 !== void 0)
    $$bindings.props_0(props_0);
  if ($$props.props_1 === void 0 && $$bindings.props_1 && props_1 !== void 0)
    $$bindings.props_1(props_1);
  if ($$props.props_2 === void 0 && $$bindings.props_2 && props_2 !== void 0)
    $$bindings.props_2(props_2);
  $$result.css.add(css$6);
  {
    stores.page.set(page);
  }
  return `


${validate_component(components[0] || missing_component, "svelte:component").$$render($$result, Object.assign(props_0 || {}), {}, {
    default: () => `${components[1] ? `${validate_component(components[1] || missing_component, "svelte:component").$$render($$result, Object.assign(props_1 || {}), {}, {
      default: () => `${components[2] ? `${validate_component(components[2] || missing_component, "svelte:component").$$render($$result, Object.assign(props_2 || {}), {}, {})}` : ``}`
    })}` : ``}`
  })}

${mounted ? `<div id="${"svelte-announcer"}" aria-live="${"assertive"}" aria-atomic="${"true"}" class="${"svelte-1j55zn5"}">${navigated ? `${escape2(title)}` : ``}</div>` : ``}`;
});
var user_hooks = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module"
});
var options = null;
function render(request, {
  prerender
} = {}) {
  const host = request.headers["host"];
  return respond({ ...request, host }, options, { prerender });
}
var index_json = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module"
});
var _slug__json = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module"
});
var css$5 = {
  code: "html{line-height:1.15;-webkit-text-size-adjust:100%}body{margin:0}main{display:block}h1{font-size:2em;margin:0.67em 0}hr{box-sizing:content-box;height:0;overflow:visible}pre{font-family:monospace, monospace;font-size:1em}a{background-color:transparent}abbr[title]{border-bottom:none;text-decoration:underline;text-decoration:underline dotted}b,strong{font-weight:bolder}code,kbd,samp{font-family:monospace, monospace;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-0.25em}sup{top:-0.5em}img{border-style:none}button,input,optgroup,select,textarea{font-family:inherit;font-size:100%;line-height:1.15;margin:0}button,input{overflow:visible}button,select{text-transform:none}button,[type=button],[type=reset],[type=submit]{-webkit-appearance:button}button::-moz-focus-inner,[type=button]::-moz-focus-inner,[type=reset]::-moz-focus-inner,[type=submit]::-moz-focus-inner{border-style:none;padding:0}button:-moz-focusring,[type=button]:-moz-focusring,[type=reset]:-moz-focusring,[type=submit]:-moz-focusring{outline:1px dotted ButtonText}fieldset{padding:0.35em 0.75em 0.625em}legend{box-sizing:border-box;color:inherit;display:table;max-width:100%;padding:0;white-space:normal}progress{vertical-align:baseline}textarea{overflow:auto}[type=checkbox],[type=radio]{box-sizing:border-box;padding:0}[type=number]::-webkit-inner-spin-button,[type=number]::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}[type=search]::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}details{display:block}summary{display:list-item}template{display:none}[hidden]{display:none}iframe{border:0 none}img{height:auto;max-width:100%}body *,body *:before,body *:after{-webkit-box-sizing:border-box;box-sizing:border-box}*{padding:0;margin:0;text-align:left;box-sizing:border-box;user-select:none;text-decoration:none}body{min-height:100vh;margin:0;-webkit-touch-callout:none;-webkit-user-select:none;overscroll-behavior-x:contain}#svelte{position:absolute;width:100vw;height:100%}",
  map: '{"version":3,"file":"__layout.svelte","sources":["__layout.svelte"],"sourcesContent":["<script>\\r\\n<\/script>\\r\\n\\r\\n<slot />\\r\\n\\r\\n<style lang=\\"scss\\" global>/*! normalize.css v8.0.1 | MIT License | github.com/necolas/normalize.css */\\n/* Document\\n   ========================================================================== */\\n/**\\n * 1. Correct the line height in all browsers.\\n * 2. Prevent adjustments of font size after orientation changes in iOS.\\n */\\n:global(html) {\\n  line-height: 1.15;\\n  /* 1 */\\n  -webkit-text-size-adjust: 100%;\\n  /* 2 */\\n}\\n\\n/* Sections\\n   ========================================================================== */\\n/**\\n * Remove the margin in all browsers.\\n */\\n:global(body) {\\n  margin: 0;\\n}\\n\\n/**\\n * Render the `main` element consistently in IE.\\n */\\n:global(main) {\\n  display: block;\\n}\\n\\n/**\\n * Correct the font size and margin on `h1` elements within `section` and\\n * `article` contexts in Chrome, Firefox, and Safari.\\n */\\n:global(h1) {\\n  font-size: 2em;\\n  margin: 0.67em 0;\\n}\\n\\n/* Grouping content\\n   ========================================================================== */\\n/**\\n * 1. Add the correct box sizing in Firefox.\\n * 2. Show the overflow in Edge and IE.\\n */\\n:global(hr) {\\n  box-sizing: content-box;\\n  /* 1 */\\n  height: 0;\\n  /* 1 */\\n  overflow: visible;\\n  /* 2 */\\n}\\n\\n/**\\n * 1. Correct the inheritance and scaling of font size in all browsers.\\n * 2. Correct the odd `em` font sizing in all browsers.\\n */\\n:global(pre) {\\n  font-family: monospace, monospace;\\n  /* 1 */\\n  font-size: 1em;\\n  /* 2 */\\n}\\n\\n/* Text-level semantics\\n   ========================================================================== */\\n/**\\n * Remove the gray background on active links in IE 10.\\n */\\n:global(a) {\\n  background-color: transparent;\\n}\\n\\n/**\\n * 1. Remove the bottom border in Chrome 57-\\n * 2. Add the correct text decoration in Chrome, Edge, IE, Opera, and Safari.\\n */\\n:global(abbr[title]) {\\n  border-bottom: none;\\n  /* 1 */\\n  text-decoration: underline;\\n  /* 2 */\\n  text-decoration: underline dotted;\\n  /* 2 */\\n}\\n\\n/**\\n * Add the correct font weight in Chrome, Edge, and Safari.\\n */\\n:global(b),\\n:global(strong) {\\n  font-weight: bolder;\\n}\\n\\n/**\\n * 1. Correct the inheritance and scaling of font size in all browsers.\\n * 2. Correct the odd `em` font sizing in all browsers.\\n */\\n:global(code),\\n:global(kbd),\\n:global(samp) {\\n  font-family: monospace, monospace;\\n  /* 1 */\\n  font-size: 1em;\\n  /* 2 */\\n}\\n\\n/**\\n * Add the correct font size in all browsers.\\n */\\n:global(small) {\\n  font-size: 80%;\\n}\\n\\n/**\\n * Prevent `sub` and `sup` elements from affecting the line height in\\n * all browsers.\\n */\\n:global(sub),\\n:global(sup) {\\n  font-size: 75%;\\n  line-height: 0;\\n  position: relative;\\n  vertical-align: baseline;\\n}\\n\\n:global(sub) {\\n  bottom: -0.25em;\\n}\\n\\n:global(sup) {\\n  top: -0.5em;\\n}\\n\\n/* Embedded content\\n   ========================================================================== */\\n/**\\n * Remove the border on images inside links in IE 10.\\n */\\n:global(img) {\\n  border-style: none;\\n}\\n\\n/* Forms\\n   ========================================================================== */\\n/**\\n * 1. Change the font styles in all browsers.\\n * 2. Remove the margin in Firefox and Safari.\\n */\\n:global(button),\\n:global(input),\\n:global(optgroup),\\n:global(select),\\n:global(textarea) {\\n  font-family: inherit;\\n  /* 1 */\\n  font-size: 100%;\\n  /* 1 */\\n  line-height: 1.15;\\n  /* 1 */\\n  margin: 0;\\n  /* 2 */\\n}\\n\\n/**\\n * Show the overflow in IE.\\n * 1. Show the overflow in Edge.\\n */\\n:global(button),\\n:global(input) {\\n  /* 1 */\\n  overflow: visible;\\n}\\n\\n/**\\n * Remove the inheritance of text transform in Edge, Firefox, and IE.\\n * 1. Remove the inheritance of text transform in Firefox.\\n */\\n:global(button),\\n:global(select) {\\n  /* 1 */\\n  text-transform: none;\\n}\\n\\n/**\\n * Correct the inability to style clickable types in iOS and Safari.\\n */\\n:global(button),\\n:global([type=button]),\\n:global([type=reset]),\\n:global([type=submit]) {\\n  -webkit-appearance: button;\\n}\\n\\n/**\\n * Remove the inner border and padding in Firefox.\\n */\\n:global(button::-moz-focus-inner),\\n:global([type=button]::-moz-focus-inner),\\n:global([type=reset]::-moz-focus-inner),\\n:global([type=submit]::-moz-focus-inner) {\\n  border-style: none;\\n  padding: 0;\\n}\\n\\n/**\\n * Restore the focus styles unset by the previous rule.\\n */\\n:global(button:-moz-focusring),\\n:global([type=button]:-moz-focusring),\\n:global([type=reset]:-moz-focusring),\\n:global([type=submit]:-moz-focusring) {\\n  outline: 1px dotted ButtonText;\\n}\\n\\n/**\\n * Correct the padding in Firefox.\\n */\\n:global(fieldset) {\\n  padding: 0.35em 0.75em 0.625em;\\n}\\n\\n/**\\n * 1. Correct the text wrapping in Edge and IE.\\n * 2. Correct the color inheritance from `fieldset` elements in IE.\\n * 3. Remove the padding so developers are not caught out when they zero out\\n *    `fieldset` elements in all browsers.\\n */\\n:global(legend) {\\n  box-sizing: border-box;\\n  /* 1 */\\n  color: inherit;\\n  /* 2 */\\n  display: table;\\n  /* 1 */\\n  max-width: 100%;\\n  /* 1 */\\n  padding: 0;\\n  /* 3 */\\n  white-space: normal;\\n  /* 1 */\\n}\\n\\n/**\\n * Add the correct vertical alignment in Chrome, Firefox, and Opera.\\n */\\n:global(progress) {\\n  vertical-align: baseline;\\n}\\n\\n/**\\n * Remove the default vertical scrollbar in IE 10+.\\n */\\n:global(textarea) {\\n  overflow: auto;\\n}\\n\\n/**\\n * 1. Add the correct box sizing in IE 10.\\n * 2. Remove the padding in IE 10.\\n */\\n:global([type=checkbox]),\\n:global([type=radio]) {\\n  box-sizing: border-box;\\n  /* 1 */\\n  padding: 0;\\n  /* 2 */\\n}\\n\\n/**\\n * Correct the cursor style of increment and decrement buttons in Chrome.\\n */\\n:global([type=number]::-webkit-inner-spin-button),\\n:global([type=number]::-webkit-outer-spin-button) {\\n  height: auto;\\n}\\n\\n/**\\n * 1. Correct the odd appearance in Chrome and Safari.\\n * 2. Correct the outline style in Safari.\\n */\\n:global([type=search]) {\\n  -webkit-appearance: textfield;\\n  /* 1 */\\n  outline-offset: -2px;\\n  /* 2 */\\n}\\n\\n/**\\n * Remove the inner padding in Chrome and Safari on macOS.\\n */\\n:global([type=search]::-webkit-search-decoration) {\\n  -webkit-appearance: none;\\n}\\n\\n/**\\n * 1. Correct the inability to style clickable types in iOS and Safari.\\n * 2. Change font properties to `inherit` in Safari.\\n */\\n:global(::-webkit-file-upload-button) {\\n  -webkit-appearance: button;\\n  /* 1 */\\n  font: inherit;\\n  /* 2 */\\n}\\n\\n/* Interactive\\n   ========================================================================== */\\n/*\\n * Add the correct display in Edge, IE 10+, and Firefox.\\n */\\n:global(details) {\\n  display: block;\\n}\\n\\n/*\\n * Add the correct display in all browsers.\\n */\\n:global(summary) {\\n  display: list-item;\\n}\\n\\n/* Misc\\n   ========================================================================== */\\n/**\\n * Add the correct display in IE 10+.\\n */\\n:global(template) {\\n  display: none;\\n}\\n\\n/**\\n * Add the correct display in IE 10.\\n */\\n:global([hidden]) {\\n  display: none;\\n}\\n\\n/**\\n * Remove frame border\\n */\\n:global(iframe) {\\n  border: 0 none;\\n}\\n\\n/**\\n * Image scaling\\n */\\n:global(img) {\\n  height: auto;\\n  max-width: 100%;\\n}\\n\\n/**\\n * Add box-sizing\\n */\\n:global(body) :global(*),\\n:global(body) :global(*:before),\\n:global(body) :global(*:after) {\\n  -webkit-box-sizing: border-box;\\n  box-sizing: border-box;\\n}\\n\\n:global(*) {\\n  padding: 0;\\n  margin: 0;\\n  text-align: left;\\n  box-sizing: border-box;\\n  user-select: none;\\n  text-decoration: none;\\n}\\n\\n:global(body) {\\n  min-height: 100vh;\\n  margin: 0;\\n  -webkit-touch-callout: none;\\n  -webkit-user-select: none;\\n  overscroll-behavior-x: contain;\\n}\\n\\n:global(#svelte) {\\n  position: absolute;\\n  width: 100vw;\\n  height: 100%;\\n}</style>"],"names":[],"mappings":"AAYQ,IAAI,AAAE,CAAC,AACb,WAAW,CAAE,IAAI,CAEjB,wBAAwB,CAAE,IAAI,AAEhC,CAAC,AAOO,IAAI,AAAE,CAAC,AACb,MAAM,CAAE,CAAC,AACX,CAAC,AAKO,IAAI,AAAE,CAAC,AACb,OAAO,CAAE,KAAK,AAChB,CAAC,AAMO,EAAE,AAAE,CAAC,AACX,SAAS,CAAE,GAAG,CACd,MAAM,CAAE,MAAM,CAAC,CAAC,AAClB,CAAC,AAQO,EAAE,AAAE,CAAC,AACX,UAAU,CAAE,WAAW,CAEvB,MAAM,CAAE,CAAC,CAET,QAAQ,CAAE,OAAO,AAEnB,CAAC,AAMO,GAAG,AAAE,CAAC,AACZ,WAAW,CAAE,SAAS,CAAC,CAAC,SAAS,CAEjC,SAAS,CAAE,GAAG,AAEhB,CAAC,AAOO,CAAC,AAAE,CAAC,AACV,gBAAgB,CAAE,WAAW,AAC/B,CAAC,AAMO,WAAW,AAAE,CAAC,AACpB,aAAa,CAAE,IAAI,CAEnB,eAAe,CAAE,SAAS,CAE1B,eAAe,CAAE,SAAS,CAAC,MAAM,AAEnC,CAAC,AAKO,CAAC,AAAC,CACF,MAAM,AAAE,CAAC,AACf,WAAW,CAAE,MAAM,AACrB,CAAC,AAMO,IAAI,AAAC,CACL,GAAG,AAAC,CACJ,IAAI,AAAE,CAAC,AACb,WAAW,CAAE,SAAS,CAAC,CAAC,SAAS,CAEjC,SAAS,CAAE,GAAG,AAEhB,CAAC,AAKO,KAAK,AAAE,CAAC,AACd,SAAS,CAAE,GAAG,AAChB,CAAC,AAMO,GAAG,AAAC,CACJ,GAAG,AAAE,CAAC,AACZ,SAAS,CAAE,GAAG,CACd,WAAW,CAAE,CAAC,CACd,QAAQ,CAAE,QAAQ,CAClB,cAAc,CAAE,QAAQ,AAC1B,CAAC,AAEO,GAAG,AAAE,CAAC,AACZ,MAAM,CAAE,OAAO,AACjB,CAAC,AAEO,GAAG,AAAE,CAAC,AACZ,GAAG,CAAE,MAAM,AACb,CAAC,AAOO,GAAG,AAAE,CAAC,AACZ,YAAY,CAAE,IAAI,AACpB,CAAC,AAQO,MAAM,AAAC,CACP,KAAK,AAAC,CACN,QAAQ,AAAC,CACT,MAAM,AAAC,CACP,QAAQ,AAAE,CAAC,AACjB,WAAW,CAAE,OAAO,CAEpB,SAAS,CAAE,IAAI,CAEf,WAAW,CAAE,IAAI,CAEjB,MAAM,CAAE,CAAC,AAEX,CAAC,AAMO,MAAM,AAAC,CACP,KAAK,AAAE,CAAC,AAEd,QAAQ,CAAE,OAAO,AACnB,CAAC,AAMO,MAAM,AAAC,CACP,MAAM,AAAE,CAAC,AAEf,cAAc,CAAE,IAAI,AACtB,CAAC,AAKO,MAAM,AAAC,CACP,aAAa,AAAC,CACd,YAAY,AAAC,CACb,aAAa,AAAE,CAAC,AACtB,kBAAkB,CAAE,MAAM,AAC5B,CAAC,AAKO,wBAAwB,AAAC,CACzB,+BAA+B,AAAC,CAChC,8BAA8B,AAAC,CAC/B,+BAA+B,AAAE,CAAC,AACxC,YAAY,CAAE,IAAI,CAClB,OAAO,CAAE,CAAC,AACZ,CAAC,AAKO,qBAAqB,AAAC,CACtB,4BAA4B,AAAC,CAC7B,2BAA2B,AAAC,CAC5B,4BAA4B,AAAE,CAAC,AACrC,OAAO,CAAE,GAAG,CAAC,MAAM,CAAC,UAAU,AAChC,CAAC,AAKO,QAAQ,AAAE,CAAC,AACjB,OAAO,CAAE,MAAM,CAAC,MAAM,CAAC,OAAO,AAChC,CAAC,AAQO,MAAM,AAAE,CAAC,AACf,UAAU,CAAE,UAAU,CAEtB,KAAK,CAAE,OAAO,CAEd,OAAO,CAAE,KAAK,CAEd,SAAS,CAAE,IAAI,CAEf,OAAO,CAAE,CAAC,CAEV,WAAW,CAAE,MAAM,AAErB,CAAC,AAKO,QAAQ,AAAE,CAAC,AACjB,cAAc,CAAE,QAAQ,AAC1B,CAAC,AAKO,QAAQ,AAAE,CAAC,AACjB,QAAQ,CAAE,IAAI,AAChB,CAAC,AAMO,eAAe,AAAC,CAChB,YAAY,AAAE,CAAC,AACrB,UAAU,CAAE,UAAU,CAEtB,OAAO,CAAE,CAAC,AAEZ,CAAC,AAKO,wCAAwC,AAAC,CACzC,wCAAwC,AAAE,CAAC,AACjD,MAAM,CAAE,IAAI,AACd,CAAC,AAMO,aAAa,AAAE,CAAC,AACtB,kBAAkB,CAAE,SAAS,CAE7B,cAAc,CAAE,IAAI,AAEtB,CAAC,AAKO,wCAAwC,AAAE,CAAC,AACjD,kBAAkB,CAAE,IAAI,AAC1B,CAAC,AAMO,4BAA4B,AAAE,CAAC,AACrC,kBAAkB,CAAE,MAAM,CAE1B,IAAI,CAAE,OAAO,AAEf,CAAC,AAOO,OAAO,AAAE,CAAC,AAChB,OAAO,CAAE,KAAK,AAChB,CAAC,AAKO,OAAO,AAAE,CAAC,AAChB,OAAO,CAAE,SAAS,AACpB,CAAC,AAOO,QAAQ,AAAE,CAAC,AACjB,OAAO,CAAE,IAAI,AACf,CAAC,AAKO,QAAQ,AAAE,CAAC,AACjB,OAAO,CAAE,IAAI,AACf,CAAC,AAKO,MAAM,AAAE,CAAC,AACf,MAAM,CAAE,CAAC,CAAC,IAAI,AAChB,CAAC,AAKO,GAAG,AAAE,CAAC,AACZ,MAAM,CAAE,IAAI,CACZ,SAAS,CAAE,IAAI,AACjB,CAAC,AAKO,IAAI,AAAC,CAAC,AAAQ,CAAC,AAAC,CAChB,IAAI,AAAC,CAAC,AAAQ,QAAQ,AAAC,CACvB,IAAI,AAAC,CAAC,AAAQ,OAAO,AAAE,CAAC,AAC9B,kBAAkB,CAAE,UAAU,CAC9B,UAAU,CAAE,UAAU,AACxB,CAAC,AAEO,CAAC,AAAE,CAAC,AACV,OAAO,CAAE,CAAC,CACV,MAAM,CAAE,CAAC,CACT,UAAU,CAAE,IAAI,CAChB,UAAU,CAAE,UAAU,CACtB,WAAW,CAAE,IAAI,CACjB,eAAe,CAAE,IAAI,AACvB,CAAC,AAEO,IAAI,AAAE,CAAC,AACb,UAAU,CAAE,KAAK,CACjB,MAAM,CAAE,CAAC,CACT,qBAAqB,CAAE,IAAI,CAC3B,mBAAmB,CAAE,IAAI,CACzB,qBAAqB,CAAE,OAAO,AAChC,CAAC,AAEO,OAAO,AAAE,CAAC,AAChB,QAAQ,CAAE,QAAQ,CAClB,KAAK,CAAE,KAAK,CACZ,MAAM,CAAE,IAAI,AACd,CAAC"}'
};
var _layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$5);
  return `${slots.default ? slots.default({}) : ``}`;
});
var __layout = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": _layout
});
function load({ error: error22, status }) {
  return { props: { error: error22, status } };
}
var Error$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { status } = $$props;
  let { error: error22 } = $$props;
  if ($$props.status === void 0 && $$bindings.status && status !== void 0)
    $$bindings.status(status);
  if ($$props.error === void 0 && $$bindings.error && error22 !== void 0)
    $$bindings.error(error22);
  return `<h1>${escape2(status)}</h1>

<pre>${escape2(error22.message)}</pre>



${error22.frame ? `<pre>${escape2(error22.frame)}</pre>` : ``}
${error22.stack ? `<pre>${escape2(error22.stack)}</pre>` : ``}`;
});
var error2 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Error$1,
  load
});
var Routes = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="${"https://kit.svelte.dev"}">kit.svelte.dev</a> to read the documentation</p>`;
});
var index$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Routes
});
function length$1(a) {
  let x = a[0];
  let y = a[1];
  let z = a[2];
  return Math.sqrt(x * x + y * y + z * z);
}
function copy$5(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  return out;
}
function set$5(out, x, y, z) {
  out[0] = x;
  out[1] = y;
  out[2] = z;
  return out;
}
function add$1(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  return out;
}
function subtract$1(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
  return out;
}
function multiply$4(out, a, b) {
  out[0] = a[0] * b[0];
  out[1] = a[1] * b[1];
  out[2] = a[2] * b[2];
  return out;
}
function divide$1(out, a, b) {
  out[0] = a[0] / b[0];
  out[1] = a[1] / b[1];
  out[2] = a[2] / b[2];
  return out;
}
function scale$3(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  return out;
}
function distance$1(a, b) {
  let x = b[0] - a[0];
  let y = b[1] - a[1];
  let z = b[2] - a[2];
  return Math.sqrt(x * x + y * y + z * z);
}
function squaredDistance$1(a, b) {
  let x = b[0] - a[0];
  let y = b[1] - a[1];
  let z = b[2] - a[2];
  return x * x + y * y + z * z;
}
function squaredLength$1(a) {
  let x = a[0];
  let y = a[1];
  let z = a[2];
  return x * x + y * y + z * z;
}
function negate$1(out, a) {
  out[0] = -a[0];
  out[1] = -a[1];
  out[2] = -a[2];
  return out;
}
function inverse$1(out, a) {
  out[0] = 1 / a[0];
  out[1] = 1 / a[1];
  out[2] = 1 / a[2];
  return out;
}
function normalize$3(out, a) {
  let x = a[0];
  let y = a[1];
  let z = a[2];
  let len = x * x + y * y + z * z;
  if (len > 0) {
    len = 1 / Math.sqrt(len);
  }
  out[0] = a[0] * len;
  out[1] = a[1] * len;
  out[2] = a[2] * len;
  return out;
}
function dot$3(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
function cross$1(out, a, b) {
  let ax = a[0], ay = a[1], az = a[2];
  let bx = b[0], by = b[1], bz = b[2];
  out[0] = ay * bz - az * by;
  out[1] = az * bx - ax * bz;
  out[2] = ax * by - ay * bx;
  return out;
}
function lerp$1(out, a, b, t) {
  let ax = a[0];
  let ay = a[1];
  let az = a[2];
  out[0] = ax + t * (b[0] - ax);
  out[1] = ay + t * (b[1] - ay);
  out[2] = az + t * (b[2] - az);
  return out;
}
function transformMat4$1(out, a, m) {
  let x = a[0], y = a[1], z = a[2];
  let w = m[3] * x + m[7] * y + m[11] * z + m[15];
  w = w || 1;
  out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
  out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
  out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
  return out;
}
function scaleRotateMat4(out, a, m) {
  let x = a[0], y = a[1], z = a[2];
  let w = m[3] * x + m[7] * y + m[11] * z + m[15];
  w = w || 1;
  out[0] = (m[0] * x + m[4] * y + m[8] * z) / w;
  out[1] = (m[1] * x + m[5] * y + m[9] * z) / w;
  out[2] = (m[2] * x + m[6] * y + m[10] * z) / w;
  return out;
}
function transformQuat(out, a, q) {
  let x = a[0], y = a[1], z = a[2];
  let qx = q[0], qy = q[1], qz = q[2], qw = q[3];
  let uvx = qy * z - qz * y;
  let uvy = qz * x - qx * z;
  let uvz = qx * y - qy * x;
  let uuvx = qy * uvz - qz * uvy;
  let uuvy = qz * uvx - qx * uvz;
  let uuvz = qx * uvy - qy * uvx;
  let w2 = qw * 2;
  uvx *= w2;
  uvy *= w2;
  uvz *= w2;
  uuvx *= 2;
  uuvy *= 2;
  uuvz *= 2;
  out[0] = x + uvx + uuvx;
  out[1] = y + uvy + uuvy;
  out[2] = z + uvz + uuvz;
  return out;
}
var angle = function() {
  const tempA = [0, 0, 0];
  const tempB = [0, 0, 0];
  return function(a, b) {
    copy$5(tempA, a);
    copy$5(tempB, b);
    normalize$3(tempA, tempA);
    normalize$3(tempB, tempB);
    let cosine = dot$3(tempA, tempB);
    if (cosine > 1) {
      return 0;
    } else if (cosine < -1) {
      return Math.PI;
    } else {
      return Math.acos(cosine);
    }
  };
}();
function exactEquals$1(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}
var Vec3 = class extends Array {
  constructor(x = 0, y = x, z = x) {
    super(x, y, z);
    return this;
  }
  get x() {
    return this[0];
  }
  get y() {
    return this[1];
  }
  get z() {
    return this[2];
  }
  set x(v) {
    this[0] = v;
  }
  set y(v) {
    this[1] = v;
  }
  set z(v) {
    this[2] = v;
  }
  set(x, y = x, z = x) {
    if (x.length)
      return this.copy(x);
    set$5(this, x, y, z);
    return this;
  }
  copy(v) {
    copy$5(this, v);
    return this;
  }
  add(va, vb) {
    if (vb)
      add$1(this, va, vb);
    else
      add$1(this, this, va);
    return this;
  }
  sub(va, vb) {
    if (vb)
      subtract$1(this, va, vb);
    else
      subtract$1(this, this, va);
    return this;
  }
  multiply(v) {
    if (v.length)
      multiply$4(this, this, v);
    else
      scale$3(this, this, v);
    return this;
  }
  divide(v) {
    if (v.length)
      divide$1(this, this, v);
    else
      scale$3(this, this, 1 / v);
    return this;
  }
  inverse(v = this) {
    inverse$1(this, v);
    return this;
  }
  len() {
    return length$1(this);
  }
  distance(v) {
    if (v)
      return distance$1(this, v);
    else
      return length$1(this);
  }
  squaredLen() {
    return squaredLength$1(this);
  }
  squaredDistance(v) {
    if (v)
      return squaredDistance$1(this, v);
    else
      return squaredLength$1(this);
  }
  negate(v = this) {
    negate$1(this, v);
    return this;
  }
  cross(va, vb) {
    if (vb)
      cross$1(this, va, vb);
    else
      cross$1(this, this, va);
    return this;
  }
  scale(v) {
    scale$3(this, this, v);
    return this;
  }
  normalize() {
    normalize$3(this, this);
    return this;
  }
  dot(v) {
    return dot$3(this, v);
  }
  equals(v) {
    return exactEquals$1(this, v);
  }
  applyMatrix4(mat4) {
    transformMat4$1(this, this, mat4);
    return this;
  }
  scaleRotateMatrix4(mat4) {
    scaleRotateMat4(this, this, mat4);
    return this;
  }
  applyQuaternion(q) {
    transformQuat(this, this, q);
    return this;
  }
  angle(v) {
    return angle(this, v);
  }
  lerp(v, t) {
    lerp$1(this, this, v, t);
    return this;
  }
  clone() {
    return new Vec3(this[0], this[1], this[2]);
  }
  fromArray(a, o = 0) {
    this[0] = a[o];
    this[1] = a[o + 1];
    this[2] = a[o + 2];
    return this;
  }
  toArray(a = [], o = 0) {
    a[o] = this[0];
    a[o + 1] = this[1];
    a[o + 2] = this[2];
    return a;
  }
  transformDirection(mat4) {
    const x = this[0];
    const y = this[1];
    const z = this[2];
    this[0] = mat4[0] * x + mat4[4] * y + mat4[8] * z;
    this[1] = mat4[1] * x + mat4[5] * y + mat4[9] * z;
    this[2] = mat4[2] * x + mat4[6] * y + mat4[10] * z;
    return this.normalize();
  }
};
var tempVec3$2 = new Vec3();
var ID$4 = 1;
var ATTR_ID = 1;
var isBoundsWarned = false;
var Geometry = class {
  constructor(gl, attributes = {}) {
    if (!gl.canvas)
      console.error("gl not passed as first argument to Geometry");
    this.gl = gl;
    this.attributes = attributes;
    this.id = ID$4++;
    this.VAOs = {};
    this.drawRange = { start: 0, count: 0 };
    this.instancedCount = 0;
    this.gl.renderer.bindVertexArray(null);
    this.gl.renderer.currentGeometry = null;
    this.glState = this.gl.renderer.state;
    for (let key in attributes) {
      this.addAttribute(key, attributes[key]);
    }
  }
  addAttribute(key, attr) {
    this.attributes[key] = attr;
    attr.id = ATTR_ID++;
    attr.size = attr.size || 1;
    attr.type = attr.type || (attr.data.constructor === Float32Array ? this.gl.FLOAT : attr.data.constructor === Uint16Array ? this.gl.UNSIGNED_SHORT : this.gl.UNSIGNED_INT);
    attr.target = key === "index" ? this.gl.ELEMENT_ARRAY_BUFFER : this.gl.ARRAY_BUFFER;
    attr.normalized = attr.normalized || false;
    attr.stride = attr.stride || 0;
    attr.offset = attr.offset || 0;
    attr.count = attr.count || (attr.stride ? attr.data.byteLength / attr.stride : attr.data.length / attr.size);
    attr.divisor = attr.instanced || 0;
    attr.needsUpdate = false;
    if (!attr.buffer) {
      attr.buffer = this.gl.createBuffer();
      this.updateAttribute(attr);
    }
    if (attr.divisor) {
      this.isInstanced = true;
      if (this.instancedCount && this.instancedCount !== attr.count * attr.divisor) {
        console.warn("geometry has multiple instanced buffers of different length");
        return this.instancedCount = Math.min(this.instancedCount, attr.count * attr.divisor);
      }
      this.instancedCount = attr.count * attr.divisor;
    } else if (key === "index") {
      this.drawRange.count = attr.count;
    } else if (!this.attributes.index) {
      this.drawRange.count = Math.max(this.drawRange.count, attr.count);
    }
  }
  updateAttribute(attr) {
    if (this.glState.boundBuffer !== attr.buffer) {
      this.gl.bindBuffer(attr.target, attr.buffer);
      this.glState.boundBuffer = attr.buffer;
    }
    this.gl.bufferData(attr.target, attr.data, this.gl.STATIC_DRAW);
    attr.needsUpdate = false;
  }
  setIndex(value) {
    this.addAttribute("index", value);
  }
  setDrawRange(start, count) {
    this.drawRange.start = start;
    this.drawRange.count = count;
  }
  setInstancedCount(value) {
    this.instancedCount = value;
  }
  createVAO(program) {
    this.VAOs[program.attributeOrder] = this.gl.renderer.createVertexArray();
    this.gl.renderer.bindVertexArray(this.VAOs[program.attributeOrder]);
    this.bindAttributes(program);
  }
  bindAttributes(program) {
    program.attributeLocations.forEach((location, { name, type }) => {
      if (!this.attributes[name]) {
        console.warn(`active attribute ${name} not being supplied`);
        return;
      }
      const attr = this.attributes[name];
      this.gl.bindBuffer(attr.target, attr.buffer);
      this.glState.boundBuffer = attr.buffer;
      let numLoc = 1;
      if (type === 35674)
        numLoc = 2;
      if (type === 35675)
        numLoc = 3;
      if (type === 35676)
        numLoc = 4;
      const size = attr.size / numLoc;
      const stride = numLoc === 1 ? 0 : numLoc * numLoc * numLoc;
      const offset = numLoc === 1 ? 0 : numLoc * numLoc;
      for (let i = 0; i < numLoc; i++) {
        this.gl.vertexAttribPointer(location + i, size, attr.type, attr.normalized, attr.stride + stride, attr.offset + i * offset);
        this.gl.enableVertexAttribArray(location + i);
        this.gl.renderer.vertexAttribDivisor(location + i, attr.divisor);
      }
    });
    if (this.attributes.index)
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.attributes.index.buffer);
  }
  draw({ program, mode = this.gl.TRIANGLES }) {
    if (this.gl.renderer.currentGeometry !== `${this.id}_${program.attributeOrder}`) {
      if (!this.VAOs[program.attributeOrder])
        this.createVAO(program);
      this.gl.renderer.bindVertexArray(this.VAOs[program.attributeOrder]);
      this.gl.renderer.currentGeometry = `${this.id}_${program.attributeOrder}`;
    }
    program.attributeLocations.forEach((location, { name }) => {
      const attr = this.attributes[name];
      if (attr.needsUpdate)
        this.updateAttribute(attr);
    });
    if (this.isInstanced) {
      if (this.attributes.index) {
        this.gl.renderer.drawElementsInstanced(mode, this.drawRange.count, this.attributes.index.type, this.attributes.index.offset + this.drawRange.start * 2, this.instancedCount);
      } else {
        this.gl.renderer.drawArraysInstanced(mode, this.drawRange.start, this.drawRange.count, this.instancedCount);
      }
    } else {
      if (this.attributes.index) {
        this.gl.drawElements(mode, this.drawRange.count, this.attributes.index.type, this.attributes.index.offset + this.drawRange.start * 2);
      } else {
        this.gl.drawArrays(mode, this.drawRange.start, this.drawRange.count);
      }
    }
  }
  getPosition() {
    const attr = this.attributes.position;
    if (attr.data)
      return attr;
    if (isBoundsWarned)
      return;
    console.warn("No position buffer data found to compute bounds");
    return isBoundsWarned = true;
  }
  computeBoundingBox(attr) {
    if (!attr)
      attr = this.getPosition();
    const array = attr.data;
    const offset = attr.offset || 0;
    const stride = attr.stride || attr.size;
    if (!this.bounds) {
      this.bounds = {
        min: new Vec3(),
        max: new Vec3(),
        center: new Vec3(),
        scale: new Vec3(),
        radius: Infinity
      };
    }
    const min = this.bounds.min;
    const max = this.bounds.max;
    const center = this.bounds.center;
    const scale2 = this.bounds.scale;
    min.set(Infinity);
    max.set(-Infinity);
    for (let i = offset, l = array.length; i < l; i += stride) {
      const x = array[i];
      const y = array[i + 1];
      const z = array[i + 2];
      min.x = Math.min(x, min.x);
      min.y = Math.min(y, min.y);
      min.z = Math.min(z, min.z);
      max.x = Math.max(x, max.x);
      max.y = Math.max(y, max.y);
      max.z = Math.max(z, max.z);
    }
    scale2.sub(max, min);
    center.add(min, max).divide(2);
  }
  computeBoundingSphere(attr) {
    if (!attr)
      attr = this.getPosition();
    const array = attr.data;
    const offset = attr.offset || 0;
    const stride = attr.stride || attr.size;
    if (!this.bounds)
      this.computeBoundingBox(attr);
    let maxRadiusSq = 0;
    for (let i = offset, l = array.length; i < l; i += stride) {
      tempVec3$2.fromArray(array, i);
      maxRadiusSq = Math.max(maxRadiusSq, this.bounds.center.squaredDistance(tempVec3$2));
    }
    this.bounds.radius = Math.sqrt(maxRadiusSq);
  }
  remove() {
    for (let key in this.VAOs) {
      this.gl.renderer.deleteVertexArray(this.VAOs[key]);
      delete this.VAOs[key];
    }
    for (let key in this.attributes) {
      this.gl.deleteBuffer(this.attributes[key].buffer);
      delete this.attributes[key];
    }
  }
};
var ID$3 = 1;
var arrayCacheF32 = {};
var Program = class {
  constructor(gl, {
    vertex: vertex2,
    fragment: fragment2,
    uniforms = {},
    transparent = false,
    cullFace = gl.BACK,
    frontFace = gl.CCW,
    depthTest = true,
    depthWrite = true,
    depthFunc = gl.LESS
  } = {}) {
    if (!gl.canvas)
      console.error("gl not passed as fist argument to Program");
    this.gl = gl;
    this.uniforms = uniforms;
    this.id = ID$3++;
    if (!vertex2)
      console.warn("vertex shader not supplied");
    if (!fragment2)
      console.warn("fragment shader not supplied");
    this.transparent = transparent;
    this.cullFace = cullFace;
    this.frontFace = frontFace;
    this.depthTest = depthTest;
    this.depthWrite = depthWrite;
    this.depthFunc = depthFunc;
    this.blendFunc = {};
    this.blendEquation = {};
    if (this.transparent && !this.blendFunc.src) {
      if (this.gl.renderer.premultipliedAlpha)
        this.setBlendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
      else
        this.setBlendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    }
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertex2);
    gl.compileShader(vertexShader);
    if (gl.getShaderInfoLog(vertexShader) !== "") {
      console.warn(`${gl.getShaderInfoLog(vertexShader)}
Vertex Shader
${addLineNumbers(vertex2)}`);
    }
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragment2);
    gl.compileShader(fragmentShader);
    if (gl.getShaderInfoLog(fragmentShader) !== "") {
      console.warn(`${gl.getShaderInfoLog(fragmentShader)}
Fragment Shader
${addLineNumbers(fragment2)}`);
    }
    this.program = gl.createProgram();
    gl.attachShader(this.program, vertexShader);
    gl.attachShader(this.program, fragmentShader);
    gl.linkProgram(this.program);
    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      return console.warn(gl.getProgramInfoLog(this.program));
    }
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    this.uniformLocations = new Map();
    let numUniforms = gl.getProgramParameter(this.program, gl.ACTIVE_UNIFORMS);
    for (let uIndex = 0; uIndex < numUniforms; uIndex++) {
      let uniform = gl.getActiveUniform(this.program, uIndex);
      this.uniformLocations.set(uniform, gl.getUniformLocation(this.program, uniform.name));
      const split = uniform.name.match(/(\w+)/g);
      uniform.uniformName = split[0];
      if (split.length === 3) {
        uniform.isStructArray = true;
        uniform.structIndex = Number(split[1]);
        uniform.structProperty = split[2];
      } else if (split.length === 2 && isNaN(Number(split[1]))) {
        uniform.isStruct = true;
        uniform.structProperty = split[1];
      }
    }
    this.attributeLocations = new Map();
    const locations = [];
    const numAttribs = gl.getProgramParameter(this.program, gl.ACTIVE_ATTRIBUTES);
    for (let aIndex = 0; aIndex < numAttribs; aIndex++) {
      const attribute = gl.getActiveAttrib(this.program, aIndex);
      const location = gl.getAttribLocation(this.program, attribute.name);
      locations[location] = attribute.name;
      this.attributeLocations.set(attribute, location);
    }
    this.attributeOrder = locations.join("");
  }
  setBlendFunc(src, dst, srcAlpha, dstAlpha) {
    this.blendFunc.src = src;
    this.blendFunc.dst = dst;
    this.blendFunc.srcAlpha = srcAlpha;
    this.blendFunc.dstAlpha = dstAlpha;
    if (src)
      this.transparent = true;
  }
  setBlendEquation(modeRGB, modeAlpha) {
    this.blendEquation.modeRGB = modeRGB;
    this.blendEquation.modeAlpha = modeAlpha;
  }
  applyState() {
    if (this.depthTest)
      this.gl.renderer.enable(this.gl.DEPTH_TEST);
    else
      this.gl.renderer.disable(this.gl.DEPTH_TEST);
    if (this.cullFace)
      this.gl.renderer.enable(this.gl.CULL_FACE);
    else
      this.gl.renderer.disable(this.gl.CULL_FACE);
    if (this.blendFunc.src)
      this.gl.renderer.enable(this.gl.BLEND);
    else
      this.gl.renderer.disable(this.gl.BLEND);
    if (this.cullFace)
      this.gl.renderer.setCullFace(this.cullFace);
    this.gl.renderer.setFrontFace(this.frontFace);
    this.gl.renderer.setDepthMask(this.depthWrite);
    this.gl.renderer.setDepthFunc(this.depthFunc);
    if (this.blendFunc.src)
      this.gl.renderer.setBlendFunc(this.blendFunc.src, this.blendFunc.dst, this.blendFunc.srcAlpha, this.blendFunc.dstAlpha);
    this.gl.renderer.setBlendEquation(this.blendEquation.modeRGB, this.blendEquation.modeAlpha);
  }
  use({ flipFaces = false } = {}) {
    let textureUnit = -1;
    const programActive = this.gl.renderer.currentProgram === this.id;
    if (!programActive) {
      this.gl.useProgram(this.program);
      this.gl.renderer.currentProgram = this.id;
    }
    this.uniformLocations.forEach((location, activeUniform) => {
      let name = activeUniform.uniformName;
      let uniform = this.uniforms[name];
      if (activeUniform.isStruct) {
        uniform = uniform[activeUniform.structProperty];
        name += `.${activeUniform.structProperty}`;
      }
      if (activeUniform.isStructArray) {
        uniform = uniform[activeUniform.structIndex][activeUniform.structProperty];
        name += `[${activeUniform.structIndex}].${activeUniform.structProperty}`;
      }
      if (!uniform) {
        return warn(`Active uniform ${name} has not been supplied`);
      }
      if (uniform && uniform.value === void 0) {
        return warn(`${name} uniform is missing a value parameter`);
      }
      if (uniform.value.texture) {
        textureUnit = textureUnit + 1;
        uniform.value.update(textureUnit);
        return setUniform(this.gl, activeUniform.type, location, textureUnit);
      }
      if (uniform.value.length && uniform.value[0].texture) {
        const textureUnits = [];
        uniform.value.forEach((value) => {
          textureUnit = textureUnit + 1;
          value.update(textureUnit);
          textureUnits.push(textureUnit);
        });
        return setUniform(this.gl, activeUniform.type, location, textureUnits);
      }
      setUniform(this.gl, activeUniform.type, location, uniform.value);
    });
    this.applyState();
    if (flipFaces)
      this.gl.renderer.setFrontFace(this.frontFace === this.gl.CCW ? this.gl.CW : this.gl.CCW);
  }
  remove() {
    this.gl.deleteProgram(this.program);
  }
};
function setUniform(gl, type, location, value) {
  value = value.length ? flatten(value) : value;
  const setValue = gl.renderer.state.uniformLocations.get(location);
  if (value.length) {
    if (setValue === void 0 || setValue.length !== value.length) {
      gl.renderer.state.uniformLocations.set(location, value.slice(0));
    } else {
      if (arraysEqual(setValue, value))
        return;
      setValue.set ? setValue.set(value) : setArray(setValue, value);
      gl.renderer.state.uniformLocations.set(location, setValue);
    }
  } else {
    if (setValue === value)
      return;
    gl.renderer.state.uniformLocations.set(location, value);
  }
  switch (type) {
    case 5126:
      return value.length ? gl.uniform1fv(location, value) : gl.uniform1f(location, value);
    case 35664:
      return gl.uniform2fv(location, value);
    case 35665:
      return gl.uniform3fv(location, value);
    case 35666:
      return gl.uniform4fv(location, value);
    case 35670:
    case 5124:
    case 35678:
    case 35680:
      return value.length ? gl.uniform1iv(location, value) : gl.uniform1i(location, value);
    case 35671:
    case 35667:
      return gl.uniform2iv(location, value);
    case 35672:
    case 35668:
      return gl.uniform3iv(location, value);
    case 35673:
    case 35669:
      return gl.uniform4iv(location, value);
    case 35674:
      return gl.uniformMatrix2fv(location, false, value);
    case 35675:
      return gl.uniformMatrix3fv(location, false, value);
    case 35676:
      return gl.uniformMatrix4fv(location, false, value);
  }
}
function addLineNumbers(string) {
  let lines = string.split("\n");
  for (let i = 0; i < lines.length; i++) {
    lines[i] = i + 1 + ": " + lines[i];
  }
  return lines.join("\n");
}
function flatten(a) {
  const arrayLen = a.length;
  const valueLen = a[0].length;
  if (valueLen === void 0)
    return a;
  const length2 = arrayLen * valueLen;
  let value = arrayCacheF32[length2];
  if (!value)
    arrayCacheF32[length2] = value = new Float32Array(length2);
  for (let i = 0; i < arrayLen; i++)
    value.set(a[i], i * valueLen);
  return value;
}
function arraysEqual(a, b) {
  if (a.length !== b.length)
    return false;
  for (let i = 0, l = a.length; i < l; i++) {
    if (a[i] !== b[i])
      return false;
  }
  return true;
}
function setArray(a, b) {
  for (let i = 0, l = a.length; i < l; i++) {
    a[i] = b[i];
  }
}
var warnCount = 0;
function warn(message) {
  if (warnCount > 100)
    return;
  console.warn(message);
  warnCount++;
  if (warnCount > 100)
    console.warn("More than 100 program warnings - stopping logs.");
}
var tempVec3$1 = new Vec3();
var ID$2 = 1;
var Renderer = class {
  constructor({
    canvas = document.createElement("canvas"),
    width = 300,
    height = 150,
    dpr = 1,
    alpha = false,
    depth = true,
    stencil = false,
    antialias = false,
    premultipliedAlpha = false,
    preserveDrawingBuffer = false,
    powerPreference = "default",
    autoClear = true,
    webgl = 2
  } = {}) {
    const attributes = { alpha, depth, stencil, antialias, premultipliedAlpha, preserveDrawingBuffer, powerPreference };
    this.dpr = dpr;
    this.alpha = alpha;
    this.color = true;
    this.depth = depth;
    this.stencil = stencil;
    this.premultipliedAlpha = premultipliedAlpha;
    this.autoClear = autoClear;
    this.id = ID$2++;
    if (webgl === 2)
      this.gl = canvas.getContext("webgl2", attributes);
    this.isWebgl2 = !!this.gl;
    if (!this.gl) {
      this.gl = canvas.getContext("webgl", attributes) || canvas.getContext("experimental-webgl", attributes);
    }
    if (!this.gl)
      console.error("unable to create webgl context");
    this.gl.renderer = this;
    this.setSize(width, height);
    this.state = {};
    this.state.blendFunc = { src: this.gl.ONE, dst: this.gl.ZERO };
    this.state.blendEquation = { modeRGB: this.gl.FUNC_ADD };
    this.state.cullFace = null;
    this.state.frontFace = this.gl.CCW;
    this.state.depthMask = true;
    this.state.depthFunc = this.gl.LESS;
    this.state.premultiplyAlpha = false;
    this.state.flipY = false;
    this.state.unpackAlignment = 4;
    this.state.framebuffer = null;
    this.state.viewport = { width: null, height: null };
    this.state.textureUnits = [];
    this.state.activeTextureUnit = 0;
    this.state.boundBuffer = null;
    this.state.uniformLocations = new Map();
    this.extensions = {};
    if (this.isWebgl2) {
      this.getExtension("EXT_color_buffer_float");
      this.getExtension("OES_texture_float_linear");
    } else {
      this.getExtension("OES_texture_float");
      this.getExtension("OES_texture_float_linear");
      this.getExtension("OES_texture_half_float");
      this.getExtension("OES_texture_half_float_linear");
      this.getExtension("OES_element_index_uint");
      this.getExtension("OES_standard_derivatives");
      this.getExtension("EXT_sRGB");
      this.getExtension("WEBGL_depth_texture");
      this.getExtension("WEBGL_draw_buffers");
    }
    this.vertexAttribDivisor = this.getExtension("ANGLE_instanced_arrays", "vertexAttribDivisor", "vertexAttribDivisorANGLE");
    this.drawArraysInstanced = this.getExtension("ANGLE_instanced_arrays", "drawArraysInstanced", "drawArraysInstancedANGLE");
    this.drawElementsInstanced = this.getExtension("ANGLE_instanced_arrays", "drawElementsInstanced", "drawElementsInstancedANGLE");
    this.createVertexArray = this.getExtension("OES_vertex_array_object", "createVertexArray", "createVertexArrayOES");
    this.bindVertexArray = this.getExtension("OES_vertex_array_object", "bindVertexArray", "bindVertexArrayOES");
    this.deleteVertexArray = this.getExtension("OES_vertex_array_object", "deleteVertexArray", "deleteVertexArrayOES");
    this.drawBuffers = this.getExtension("WEBGL_draw_buffers", "drawBuffers", "drawBuffersWEBGL");
    this.parameters = {};
    this.parameters.maxTextureUnits = this.gl.getParameter(this.gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
    this.parameters.maxAnisotropy = this.getExtension("EXT_texture_filter_anisotropic") ? this.gl.getParameter(this.getExtension("EXT_texture_filter_anisotropic").MAX_TEXTURE_MAX_ANISOTROPY_EXT) : 0;
  }
  setSize(width, height) {
    this.width = width;
    this.height = height;
    this.gl.canvas.width = width * this.dpr;
    this.gl.canvas.height = height * this.dpr;
    Object.assign(this.gl.canvas.style, {
      width: width + "px",
      height: height + "px"
    });
  }
  setViewport(width, height) {
    if (this.state.viewport.width === width && this.state.viewport.height === height)
      return;
    this.state.viewport.width = width;
    this.state.viewport.height = height;
    this.gl.viewport(0, 0, width, height);
  }
  enable(id) {
    if (this.state[id] === true)
      return;
    this.gl.enable(id);
    this.state[id] = true;
  }
  disable(id) {
    if (this.state[id] === false)
      return;
    this.gl.disable(id);
    this.state[id] = false;
  }
  setBlendFunc(src, dst, srcAlpha, dstAlpha) {
    if (this.state.blendFunc.src === src && this.state.blendFunc.dst === dst && this.state.blendFunc.srcAlpha === srcAlpha && this.state.blendFunc.dstAlpha === dstAlpha)
      return;
    this.state.blendFunc.src = src;
    this.state.blendFunc.dst = dst;
    this.state.blendFunc.srcAlpha = srcAlpha;
    this.state.blendFunc.dstAlpha = dstAlpha;
    if (srcAlpha !== void 0)
      this.gl.blendFuncSeparate(src, dst, srcAlpha, dstAlpha);
    else
      this.gl.blendFunc(src, dst);
  }
  setBlendEquation(modeRGB, modeAlpha) {
    modeRGB = modeRGB || this.gl.FUNC_ADD;
    if (this.state.blendEquation.modeRGB === modeRGB && this.state.blendEquation.modeAlpha === modeAlpha)
      return;
    this.state.blendEquation.modeRGB = modeRGB;
    this.state.blendEquation.modeAlpha = modeAlpha;
    if (modeAlpha !== void 0)
      this.gl.blendEquationSeparate(modeRGB, modeAlpha);
    else
      this.gl.blendEquation(modeRGB);
  }
  setCullFace(value) {
    if (this.state.cullFace === value)
      return;
    this.state.cullFace = value;
    this.gl.cullFace(value);
  }
  setFrontFace(value) {
    if (this.state.frontFace === value)
      return;
    this.state.frontFace = value;
    this.gl.frontFace(value);
  }
  setDepthMask(value) {
    if (this.state.depthMask === value)
      return;
    this.state.depthMask = value;
    this.gl.depthMask(value);
  }
  setDepthFunc(value) {
    if (this.state.depthFunc === value)
      return;
    this.state.depthFunc = value;
    this.gl.depthFunc(value);
  }
  activeTexture(value) {
    if (this.state.activeTextureUnit === value)
      return;
    this.state.activeTextureUnit = value;
    this.gl.activeTexture(this.gl.TEXTURE0 + value);
  }
  bindFramebuffer({ target = this.gl.FRAMEBUFFER, buffer = null } = {}) {
    if (this.state.framebuffer === buffer)
      return;
    this.state.framebuffer = buffer;
    this.gl.bindFramebuffer(target, buffer);
  }
  getExtension(extension, webgl2Func, extFunc) {
    if (webgl2Func && this.gl[webgl2Func])
      return this.gl[webgl2Func].bind(this.gl);
    if (!this.extensions[extension]) {
      this.extensions[extension] = this.gl.getExtension(extension);
    }
    if (!webgl2Func)
      return this.extensions[extension];
    if (!this.extensions[extension])
      return null;
    return this.extensions[extension][extFunc].bind(this.extensions[extension]);
  }
  sortOpaque(a, b) {
    if (a.renderOrder !== b.renderOrder) {
      return a.renderOrder - b.renderOrder;
    } else if (a.program.id !== b.program.id) {
      return a.program.id - b.program.id;
    } else if (a.zDepth !== b.zDepth) {
      return a.zDepth - b.zDepth;
    } else {
      return b.id - a.id;
    }
  }
  sortTransparent(a, b) {
    if (a.renderOrder !== b.renderOrder) {
      return a.renderOrder - b.renderOrder;
    }
    if (a.zDepth !== b.zDepth) {
      return b.zDepth - a.zDepth;
    } else {
      return b.id - a.id;
    }
  }
  sortUI(a, b) {
    if (a.renderOrder !== b.renderOrder) {
      return a.renderOrder - b.renderOrder;
    } else if (a.program.id !== b.program.id) {
      return a.program.id - b.program.id;
    } else {
      return b.id - a.id;
    }
  }
  getRenderList({ scene, camera, frustumCull, sort }) {
    let renderList = [];
    if (camera && frustumCull)
      camera.updateFrustum();
    scene.traverse((node) => {
      if (!node.visible)
        return true;
      if (!node.draw)
        return;
      if (frustumCull && node.frustumCulled && camera) {
        if (!camera.frustumIntersectsMesh(node))
          return;
      }
      renderList.push(node);
    });
    if (sort) {
      const opaque = [];
      const transparent = [];
      const ui = [];
      renderList.forEach((node) => {
        if (!node.program.transparent) {
          opaque.push(node);
        } else if (node.program.depthTest) {
          transparent.push(node);
        } else {
          ui.push(node);
        }
        node.zDepth = 0;
        if (node.renderOrder !== 0 || !node.program.depthTest || !camera)
          return;
        node.worldMatrix.getTranslation(tempVec3$1);
        tempVec3$1.applyMatrix4(camera.projectionViewMatrix);
        node.zDepth = tempVec3$1.z;
      });
      opaque.sort(this.sortOpaque);
      transparent.sort(this.sortTransparent);
      ui.sort(this.sortUI);
      renderList = opaque.concat(transparent, ui);
    }
    return renderList;
  }
  render({ scene, camera, target = null, update: update2 = true, sort = true, frustumCull = true, clear }) {
    if (target === null) {
      this.bindFramebuffer();
      this.setViewport(this.width * this.dpr, this.height * this.dpr);
    } else {
      this.bindFramebuffer(target);
      this.setViewport(target.width, target.height);
    }
    if (clear || this.autoClear && clear !== false) {
      if (this.depth && (!target || target.depth)) {
        this.enable(this.gl.DEPTH_TEST);
        this.setDepthMask(true);
      }
      this.gl.clear((this.color ? this.gl.COLOR_BUFFER_BIT : 0) | (this.depth ? this.gl.DEPTH_BUFFER_BIT : 0) | (this.stencil ? this.gl.STENCIL_BUFFER_BIT : 0));
    }
    if (update2)
      scene.updateMatrixWorld();
    if (camera)
      camera.updateMatrixWorld();
    const renderList = this.getRenderList({ scene, camera, frustumCull, sort });
    renderList.forEach((node) => {
      node.draw({ camera });
    });
  }
};
function copy$4(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  return out;
}
function set$4(out, x, y, z, w) {
  out[0] = x;
  out[1] = y;
  out[2] = z;
  out[3] = w;
  return out;
}
function normalize$2(out, a) {
  let x = a[0];
  let y = a[1];
  let z = a[2];
  let w = a[3];
  let len = x * x + y * y + z * z + w * w;
  if (len > 0) {
    len = 1 / Math.sqrt(len);
  }
  out[0] = x * len;
  out[1] = y * len;
  out[2] = z * len;
  out[3] = w * len;
  return out;
}
function dot$2(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
}
function identity$3(out) {
  out[0] = 0;
  out[1] = 0;
  out[2] = 0;
  out[3] = 1;
  return out;
}
function setAxisAngle(out, axis, rad) {
  rad = rad * 0.5;
  let s2 = Math.sin(rad);
  out[0] = s2 * axis[0];
  out[1] = s2 * axis[1];
  out[2] = s2 * axis[2];
  out[3] = Math.cos(rad);
  return out;
}
function multiply$3(out, a, b) {
  let ax = a[0], ay = a[1], az = a[2], aw = a[3];
  let bx = b[0], by = b[1], bz = b[2], bw = b[3];
  out[0] = ax * bw + aw * bx + ay * bz - az * by;
  out[1] = ay * bw + aw * by + az * bx - ax * bz;
  out[2] = az * bw + aw * bz + ax * by - ay * bx;
  out[3] = aw * bw - ax * bx - ay * by - az * bz;
  return out;
}
function rotateX(out, a, rad) {
  rad *= 0.5;
  let ax = a[0], ay = a[1], az = a[2], aw = a[3];
  let bx = Math.sin(rad), bw = Math.cos(rad);
  out[0] = ax * bw + aw * bx;
  out[1] = ay * bw + az * bx;
  out[2] = az * bw - ay * bx;
  out[3] = aw * bw - ax * bx;
  return out;
}
function rotateY(out, a, rad) {
  rad *= 0.5;
  let ax = a[0], ay = a[1], az = a[2], aw = a[3];
  let by = Math.sin(rad), bw = Math.cos(rad);
  out[0] = ax * bw - az * by;
  out[1] = ay * bw + aw * by;
  out[2] = az * bw + ax * by;
  out[3] = aw * bw - ay * by;
  return out;
}
function rotateZ(out, a, rad) {
  rad *= 0.5;
  let ax = a[0], ay = a[1], az = a[2], aw = a[3];
  let bz = Math.sin(rad), bw = Math.cos(rad);
  out[0] = ax * bw + ay * bz;
  out[1] = ay * bw - ax * bz;
  out[2] = az * bw + aw * bz;
  out[3] = aw * bw - az * bz;
  return out;
}
function slerp(out, a, b, t) {
  let ax = a[0], ay = a[1], az = a[2], aw = a[3];
  let bx = b[0], by = b[1], bz = b[2], bw = b[3];
  let omega, cosom, sinom, scale0, scale1;
  cosom = ax * bx + ay * by + az * bz + aw * bw;
  if (cosom < 0) {
    cosom = -cosom;
    bx = -bx;
    by = -by;
    bz = -bz;
    bw = -bw;
  }
  if (1 - cosom > 1e-6) {
    omega = Math.acos(cosom);
    sinom = Math.sin(omega);
    scale0 = Math.sin((1 - t) * omega) / sinom;
    scale1 = Math.sin(t * omega) / sinom;
  } else {
    scale0 = 1 - t;
    scale1 = t;
  }
  out[0] = scale0 * ax + scale1 * bx;
  out[1] = scale0 * ay + scale1 * by;
  out[2] = scale0 * az + scale1 * bz;
  out[3] = scale0 * aw + scale1 * bw;
  return out;
}
function invert$2(out, a) {
  let a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3];
  let dot2 = a0 * a0 + a1 * a1 + a2 * a2 + a3 * a3;
  let invDot = dot2 ? 1 / dot2 : 0;
  out[0] = -a0 * invDot;
  out[1] = -a1 * invDot;
  out[2] = -a2 * invDot;
  out[3] = a3 * invDot;
  return out;
}
function conjugate(out, a) {
  out[0] = -a[0];
  out[1] = -a[1];
  out[2] = -a[2];
  out[3] = a[3];
  return out;
}
function fromMat3(out, m) {
  let fTrace = m[0] + m[4] + m[8];
  let fRoot;
  if (fTrace > 0) {
    fRoot = Math.sqrt(fTrace + 1);
    out[3] = 0.5 * fRoot;
    fRoot = 0.5 / fRoot;
    out[0] = (m[5] - m[7]) * fRoot;
    out[1] = (m[6] - m[2]) * fRoot;
    out[2] = (m[1] - m[3]) * fRoot;
  } else {
    let i = 0;
    if (m[4] > m[0])
      i = 1;
    if (m[8] > m[i * 3 + i])
      i = 2;
    let j = (i + 1) % 3;
    let k = (i + 2) % 3;
    fRoot = Math.sqrt(m[i * 3 + i] - m[j * 3 + j] - m[k * 3 + k] + 1);
    out[i] = 0.5 * fRoot;
    fRoot = 0.5 / fRoot;
    out[3] = (m[j * 3 + k] - m[k * 3 + j]) * fRoot;
    out[j] = (m[j * 3 + i] + m[i * 3 + j]) * fRoot;
    out[k] = (m[k * 3 + i] + m[i * 3 + k]) * fRoot;
  }
  return out;
}
function fromEuler(out, euler, order = "YXZ") {
  let sx = Math.sin(euler[0] * 0.5);
  let cx = Math.cos(euler[0] * 0.5);
  let sy = Math.sin(euler[1] * 0.5);
  let cy = Math.cos(euler[1] * 0.5);
  let sz = Math.sin(euler[2] * 0.5);
  let cz = Math.cos(euler[2] * 0.5);
  if (order === "XYZ") {
    out[0] = sx * cy * cz + cx * sy * sz;
    out[1] = cx * sy * cz - sx * cy * sz;
    out[2] = cx * cy * sz + sx * sy * cz;
    out[3] = cx * cy * cz - sx * sy * sz;
  } else if (order === "YXZ") {
    out[0] = sx * cy * cz + cx * sy * sz;
    out[1] = cx * sy * cz - sx * cy * sz;
    out[2] = cx * cy * sz - sx * sy * cz;
    out[3] = cx * cy * cz + sx * sy * sz;
  } else if (order === "ZXY") {
    out[0] = sx * cy * cz - cx * sy * sz;
    out[1] = cx * sy * cz + sx * cy * sz;
    out[2] = cx * cy * sz + sx * sy * cz;
    out[3] = cx * cy * cz - sx * sy * sz;
  } else if (order === "ZYX") {
    out[0] = sx * cy * cz - cx * sy * sz;
    out[1] = cx * sy * cz + sx * cy * sz;
    out[2] = cx * cy * sz - sx * sy * cz;
    out[3] = cx * cy * cz + sx * sy * sz;
  } else if (order === "YZX") {
    out[0] = sx * cy * cz + cx * sy * sz;
    out[1] = cx * sy * cz + sx * cy * sz;
    out[2] = cx * cy * sz - sx * sy * cz;
    out[3] = cx * cy * cz - sx * sy * sz;
  } else if (order === "XZY") {
    out[0] = sx * cy * cz - cx * sy * sz;
    out[1] = cx * sy * cz - sx * cy * sz;
    out[2] = cx * cy * sz + sx * sy * cz;
    out[3] = cx * cy * cz + sx * sy * sz;
  }
  return out;
}
var copy$3 = copy$4;
var set$3 = set$4;
var dot$1 = dot$2;
var normalize$1 = normalize$2;
var Quat = class extends Array {
  constructor(x = 0, y = 0, z = 0, w = 1) {
    super(x, y, z, w);
    this.onChange = () => {
    };
    return this;
  }
  get x() {
    return this[0];
  }
  get y() {
    return this[1];
  }
  get z() {
    return this[2];
  }
  get w() {
    return this[3];
  }
  set x(v) {
    this[0] = v;
    this.onChange();
  }
  set y(v) {
    this[1] = v;
    this.onChange();
  }
  set z(v) {
    this[2] = v;
    this.onChange();
  }
  set w(v) {
    this[3] = v;
    this.onChange();
  }
  identity() {
    identity$3(this);
    this.onChange();
    return this;
  }
  set(x, y, z, w) {
    if (x.length)
      return this.copy(x);
    set$3(this, x, y, z, w);
    this.onChange();
    return this;
  }
  rotateX(a) {
    rotateX(this, this, a);
    this.onChange();
    return this;
  }
  rotateY(a) {
    rotateY(this, this, a);
    this.onChange();
    return this;
  }
  rotateZ(a) {
    rotateZ(this, this, a);
    this.onChange();
    return this;
  }
  inverse(q = this) {
    invert$2(this, q);
    this.onChange();
    return this;
  }
  conjugate(q = this) {
    conjugate(this, q);
    this.onChange();
    return this;
  }
  copy(q) {
    copy$3(this, q);
    this.onChange();
    return this;
  }
  normalize(q = this) {
    normalize$1(this, q);
    this.onChange();
    return this;
  }
  multiply(qA, qB) {
    if (qB) {
      multiply$3(this, qA, qB);
    } else {
      multiply$3(this, this, qA);
    }
    this.onChange();
    return this;
  }
  dot(v) {
    return dot$1(this, v);
  }
  fromMatrix3(matrix3) {
    fromMat3(this, matrix3);
    this.onChange();
    return this;
  }
  fromEuler(euler) {
    fromEuler(this, euler, euler.order);
    return this;
  }
  fromAxisAngle(axis, a) {
    setAxisAngle(this, axis, a);
    return this;
  }
  slerp(q, t) {
    slerp(this, this, q, t);
    return this;
  }
  fromArray(a, o = 0) {
    this[0] = a[o];
    this[1] = a[o + 1];
    this[2] = a[o + 2];
    this[3] = a[o + 3];
    return this;
  }
  toArray(a = [], o = 0) {
    a[o] = this[0];
    a[o + 1] = this[1];
    a[o + 2] = this[2];
    a[o + 3] = this[3];
    return a;
  }
};
var EPSILON = 1e-6;
function copy$2(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a[4];
  out[5] = a[5];
  out[6] = a[6];
  out[7] = a[7];
  out[8] = a[8];
  out[9] = a[9];
  out[10] = a[10];
  out[11] = a[11];
  out[12] = a[12];
  out[13] = a[13];
  out[14] = a[14];
  out[15] = a[15];
  return out;
}
function set$2(out, m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
  out[0] = m00;
  out[1] = m01;
  out[2] = m02;
  out[3] = m03;
  out[4] = m10;
  out[5] = m11;
  out[6] = m12;
  out[7] = m13;
  out[8] = m20;
  out[9] = m21;
  out[10] = m22;
  out[11] = m23;
  out[12] = m30;
  out[13] = m31;
  out[14] = m32;
  out[15] = m33;
  return out;
}
function identity$2(out) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = 1;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 1;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
function invert$1(out, a) {
  let a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
  let a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
  let a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
  let a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
  let b00 = a00 * a11 - a01 * a10;
  let b01 = a00 * a12 - a02 * a10;
  let b02 = a00 * a13 - a03 * a10;
  let b03 = a01 * a12 - a02 * a11;
  let b04 = a01 * a13 - a03 * a11;
  let b05 = a02 * a13 - a03 * a12;
  let b06 = a20 * a31 - a21 * a30;
  let b07 = a20 * a32 - a22 * a30;
  let b08 = a20 * a33 - a23 * a30;
  let b09 = a21 * a32 - a22 * a31;
  let b10 = a21 * a33 - a23 * a31;
  let b11 = a22 * a33 - a23 * a32;
  let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
  if (!det) {
    return null;
  }
  det = 1 / det;
  out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
  out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
  out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
  out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
  out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
  out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
  out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
  out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
  out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
  out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
  out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
  out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
  out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
  out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
  out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
  out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
  return out;
}
function determinant(a) {
  let a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
  let a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
  let a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
  let a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
  let b00 = a00 * a11 - a01 * a10;
  let b01 = a00 * a12 - a02 * a10;
  let b02 = a00 * a13 - a03 * a10;
  let b03 = a01 * a12 - a02 * a11;
  let b04 = a01 * a13 - a03 * a11;
  let b05 = a02 * a13 - a03 * a12;
  let b06 = a20 * a31 - a21 * a30;
  let b07 = a20 * a32 - a22 * a30;
  let b08 = a20 * a33 - a23 * a30;
  let b09 = a21 * a32 - a22 * a31;
  let b10 = a21 * a33 - a23 * a31;
  let b11 = a22 * a33 - a23 * a32;
  return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
}
function multiply$2(out, a, b) {
  let a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
  let a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
  let a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
  let a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
  let b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
  out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  b0 = b[4];
  b1 = b[5];
  b2 = b[6];
  b3 = b[7];
  out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  b0 = b[8];
  b1 = b[9];
  b2 = b[10];
  b3 = b[11];
  out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  b0 = b[12];
  b1 = b[13];
  b2 = b[14];
  b3 = b[15];
  out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  return out;
}
function translate$1(out, a, v) {
  let x = v[0], y = v[1], z = v[2];
  let a00, a01, a02, a03;
  let a10, a11, a12, a13;
  let a20, a21, a22, a23;
  if (a === out) {
    out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
    out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
    out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
    out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
  } else {
    a00 = a[0];
    a01 = a[1];
    a02 = a[2];
    a03 = a[3];
    a10 = a[4];
    a11 = a[5];
    a12 = a[6];
    a13 = a[7];
    a20 = a[8];
    a21 = a[9];
    a22 = a[10];
    a23 = a[11];
    out[0] = a00;
    out[1] = a01;
    out[2] = a02;
    out[3] = a03;
    out[4] = a10;
    out[5] = a11;
    out[6] = a12;
    out[7] = a13;
    out[8] = a20;
    out[9] = a21;
    out[10] = a22;
    out[11] = a23;
    out[12] = a00 * x + a10 * y + a20 * z + a[12];
    out[13] = a01 * x + a11 * y + a21 * z + a[13];
    out[14] = a02 * x + a12 * y + a22 * z + a[14];
    out[15] = a03 * x + a13 * y + a23 * z + a[15];
  }
  return out;
}
function scale$2(out, a, v) {
  let x = v[0], y = v[1], z = v[2];
  out[0] = a[0] * x;
  out[1] = a[1] * x;
  out[2] = a[2] * x;
  out[3] = a[3] * x;
  out[4] = a[4] * y;
  out[5] = a[5] * y;
  out[6] = a[6] * y;
  out[7] = a[7] * y;
  out[8] = a[8] * z;
  out[9] = a[9] * z;
  out[10] = a[10] * z;
  out[11] = a[11] * z;
  out[12] = a[12];
  out[13] = a[13];
  out[14] = a[14];
  out[15] = a[15];
  return out;
}
function rotate$1(out, a, rad, axis) {
  let x = axis[0], y = axis[1], z = axis[2];
  let len = Math.hypot(x, y, z);
  let s2, c, t;
  let a00, a01, a02, a03;
  let a10, a11, a12, a13;
  let a20, a21, a22, a23;
  let b00, b01, b02;
  let b10, b11, b12;
  let b20, b21, b22;
  if (Math.abs(len) < EPSILON) {
    return null;
  }
  len = 1 / len;
  x *= len;
  y *= len;
  z *= len;
  s2 = Math.sin(rad);
  c = Math.cos(rad);
  t = 1 - c;
  a00 = a[0];
  a01 = a[1];
  a02 = a[2];
  a03 = a[3];
  a10 = a[4];
  a11 = a[5];
  a12 = a[6];
  a13 = a[7];
  a20 = a[8];
  a21 = a[9];
  a22 = a[10];
  a23 = a[11];
  b00 = x * x * t + c;
  b01 = y * x * t + z * s2;
  b02 = z * x * t - y * s2;
  b10 = x * y * t - z * s2;
  b11 = y * y * t + c;
  b12 = z * y * t + x * s2;
  b20 = x * z * t + y * s2;
  b21 = y * z * t - x * s2;
  b22 = z * z * t + c;
  out[0] = a00 * b00 + a10 * b01 + a20 * b02;
  out[1] = a01 * b00 + a11 * b01 + a21 * b02;
  out[2] = a02 * b00 + a12 * b01 + a22 * b02;
  out[3] = a03 * b00 + a13 * b01 + a23 * b02;
  out[4] = a00 * b10 + a10 * b11 + a20 * b12;
  out[5] = a01 * b10 + a11 * b11 + a21 * b12;
  out[6] = a02 * b10 + a12 * b11 + a22 * b12;
  out[7] = a03 * b10 + a13 * b11 + a23 * b12;
  out[8] = a00 * b20 + a10 * b21 + a20 * b22;
  out[9] = a01 * b20 + a11 * b21 + a21 * b22;
  out[10] = a02 * b20 + a12 * b21 + a22 * b22;
  out[11] = a03 * b20 + a13 * b21 + a23 * b22;
  if (a !== out) {
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  }
  return out;
}
function getTranslation(out, mat) {
  out[0] = mat[12];
  out[1] = mat[13];
  out[2] = mat[14];
  return out;
}
function getScaling(out, mat) {
  let m11 = mat[0];
  let m12 = mat[1];
  let m13 = mat[2];
  let m21 = mat[4];
  let m22 = mat[5];
  let m23 = mat[6];
  let m31 = mat[8];
  let m32 = mat[9];
  let m33 = mat[10];
  out[0] = Math.hypot(m11, m12, m13);
  out[1] = Math.hypot(m21, m22, m23);
  out[2] = Math.hypot(m31, m32, m33);
  return out;
}
function getMaxScaleOnAxis(mat) {
  let m11 = mat[0];
  let m12 = mat[1];
  let m13 = mat[2];
  let m21 = mat[4];
  let m22 = mat[5];
  let m23 = mat[6];
  let m31 = mat[8];
  let m32 = mat[9];
  let m33 = mat[10];
  const x = m11 * m11 + m12 * m12 + m13 * m13;
  const y = m21 * m21 + m22 * m22 + m23 * m23;
  const z = m31 * m31 + m32 * m32 + m33 * m33;
  return Math.sqrt(Math.max(x, y, z));
}
var getRotation = function() {
  const temp = [0, 0, 0];
  return function(out, mat) {
    let scaling = temp;
    getScaling(scaling, mat);
    let is1 = 1 / scaling[0];
    let is2 = 1 / scaling[1];
    let is3 = 1 / scaling[2];
    let sm11 = mat[0] * is1;
    let sm12 = mat[1] * is2;
    let sm13 = mat[2] * is3;
    let sm21 = mat[4] * is1;
    let sm22 = mat[5] * is2;
    let sm23 = mat[6] * is3;
    let sm31 = mat[8] * is1;
    let sm32 = mat[9] * is2;
    let sm33 = mat[10] * is3;
    let trace = sm11 + sm22 + sm33;
    let S = 0;
    if (trace > 0) {
      S = Math.sqrt(trace + 1) * 2;
      out[3] = 0.25 * S;
      out[0] = (sm23 - sm32) / S;
      out[1] = (sm31 - sm13) / S;
      out[2] = (sm12 - sm21) / S;
    } else if (sm11 > sm22 && sm11 > sm33) {
      S = Math.sqrt(1 + sm11 - sm22 - sm33) * 2;
      out[3] = (sm23 - sm32) / S;
      out[0] = 0.25 * S;
      out[1] = (sm12 + sm21) / S;
      out[2] = (sm31 + sm13) / S;
    } else if (sm22 > sm33) {
      S = Math.sqrt(1 + sm22 - sm11 - sm33) * 2;
      out[3] = (sm31 - sm13) / S;
      out[0] = (sm12 + sm21) / S;
      out[1] = 0.25 * S;
      out[2] = (sm23 + sm32) / S;
    } else {
      S = Math.sqrt(1 + sm33 - sm11 - sm22) * 2;
      out[3] = (sm12 - sm21) / S;
      out[0] = (sm31 + sm13) / S;
      out[1] = (sm23 + sm32) / S;
      out[2] = 0.25 * S;
    }
    return out;
  };
}();
function fromRotationTranslationScale(out, q, v, s2) {
  let x = q[0], y = q[1], z = q[2], w = q[3];
  let x2 = x + x;
  let y2 = y + y;
  let z2 = z + z;
  let xx = x * x2;
  let xy = x * y2;
  let xz = x * z2;
  let yy = y * y2;
  let yz = y * z2;
  let zz = z * z2;
  let wx = w * x2;
  let wy = w * y2;
  let wz = w * z2;
  let sx = s2[0];
  let sy = s2[1];
  let sz = s2[2];
  out[0] = (1 - (yy + zz)) * sx;
  out[1] = (xy + wz) * sx;
  out[2] = (xz - wy) * sx;
  out[3] = 0;
  out[4] = (xy - wz) * sy;
  out[5] = (1 - (xx + zz)) * sy;
  out[6] = (yz + wx) * sy;
  out[7] = 0;
  out[8] = (xz + wy) * sz;
  out[9] = (yz - wx) * sz;
  out[10] = (1 - (xx + yy)) * sz;
  out[11] = 0;
  out[12] = v[0];
  out[13] = v[1];
  out[14] = v[2];
  out[15] = 1;
  return out;
}
function fromQuat$1(out, q) {
  let x = q[0], y = q[1], z = q[2], w = q[3];
  let x2 = x + x;
  let y2 = y + y;
  let z2 = z + z;
  let xx = x * x2;
  let yx = y * x2;
  let yy = y * y2;
  let zx = z * x2;
  let zy = z * y2;
  let zz = z * z2;
  let wx = w * x2;
  let wy = w * y2;
  let wz = w * z2;
  out[0] = 1 - yy - zz;
  out[1] = yx + wz;
  out[2] = zx - wy;
  out[3] = 0;
  out[4] = yx - wz;
  out[5] = 1 - xx - zz;
  out[6] = zy + wx;
  out[7] = 0;
  out[8] = zx + wy;
  out[9] = zy - wx;
  out[10] = 1 - xx - yy;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
function perspective(out, fovy, aspect, near, far) {
  let f = 1 / Math.tan(fovy / 2);
  let nf = 1 / (near - far);
  out[0] = f / aspect;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = f;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = (far + near) * nf;
  out[11] = -1;
  out[12] = 0;
  out[13] = 0;
  out[14] = 2 * far * near * nf;
  out[15] = 0;
  return out;
}
function ortho(out, left, right, bottom, top, near, far) {
  let lr = 1 / (left - right);
  let bt = 1 / (bottom - top);
  let nf = 1 / (near - far);
  out[0] = -2 * lr;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = -2 * bt;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 2 * nf;
  out[11] = 0;
  out[12] = (left + right) * lr;
  out[13] = (top + bottom) * bt;
  out[14] = (far + near) * nf;
  out[15] = 1;
  return out;
}
function targetTo(out, eye, target, up) {
  let eyex = eye[0], eyey = eye[1], eyez = eye[2], upx = up[0], upy = up[1], upz = up[2];
  let z0 = eyex - target[0], z1 = eyey - target[1], z2 = eyez - target[2];
  let len = z0 * z0 + z1 * z1 + z2 * z2;
  if (len === 0) {
    z2 = 1;
  } else {
    len = 1 / Math.sqrt(len);
    z0 *= len;
    z1 *= len;
    z2 *= len;
  }
  let x0 = upy * z2 - upz * z1, x1 = upz * z0 - upx * z2, x2 = upx * z1 - upy * z0;
  len = x0 * x0 + x1 * x1 + x2 * x2;
  if (len === 0) {
    if (upz) {
      upx += 1e-6;
    } else if (upy) {
      upz += 1e-6;
    } else {
      upy += 1e-6;
    }
    x0 = upy * z2 - upz * z1, x1 = upz * z0 - upx * z2, x2 = upx * z1 - upy * z0;
    len = x0 * x0 + x1 * x1 + x2 * x2;
  }
  len = 1 / Math.sqrt(len);
  x0 *= len;
  x1 *= len;
  x2 *= len;
  out[0] = x0;
  out[1] = x1;
  out[2] = x2;
  out[3] = 0;
  out[4] = z1 * x2 - z2 * x1;
  out[5] = z2 * x0 - z0 * x2;
  out[6] = z0 * x1 - z1 * x0;
  out[7] = 0;
  out[8] = z0;
  out[9] = z1;
  out[10] = z2;
  out[11] = 0;
  out[12] = eyex;
  out[13] = eyey;
  out[14] = eyez;
  out[15] = 1;
  return out;
}
var Mat4 = class extends Array {
  constructor(m00 = 1, m01 = 0, m02 = 0, m03 = 0, m10 = 0, m11 = 1, m12 = 0, m13 = 0, m20 = 0, m21 = 0, m22 = 1, m23 = 0, m30 = 0, m31 = 0, m32 = 0, m33 = 1) {
    super(m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33);
    return this;
  }
  get x() {
    return this[12];
  }
  get y() {
    return this[13];
  }
  get z() {
    return this[14];
  }
  get w() {
    return this[15];
  }
  set x(v) {
    this[12] = v;
  }
  set y(v) {
    this[13] = v;
  }
  set z(v) {
    this[14] = v;
  }
  set w(v) {
    this[15] = v;
  }
  set(m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
    if (m00.length)
      return this.copy(m00);
    set$2(this, m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33);
    return this;
  }
  translate(v, m = this) {
    translate$1(this, m, v);
    return this;
  }
  rotate(v, axis, m = this) {
    rotate$1(this, m, v, axis);
    return this;
  }
  scale(v, m = this) {
    scale$2(this, m, typeof v === "number" ? [v, v, v] : v);
    return this;
  }
  multiply(ma, mb) {
    if (mb) {
      multiply$2(this, ma, mb);
    } else {
      multiply$2(this, this, ma);
    }
    return this;
  }
  identity() {
    identity$2(this);
    return this;
  }
  copy(m) {
    copy$2(this, m);
    return this;
  }
  fromPerspective({ fov, aspect, near, far } = {}) {
    perspective(this, fov, aspect, near, far);
    return this;
  }
  fromOrthogonal({ left, right, bottom, top, near, far }) {
    ortho(this, left, right, bottom, top, near, far);
    return this;
  }
  fromQuaternion(q) {
    fromQuat$1(this, q);
    return this;
  }
  setPosition(v) {
    this.x = v[0];
    this.y = v[1];
    this.z = v[2];
    return this;
  }
  inverse(m = this) {
    invert$1(this, m);
    return this;
  }
  compose(q, pos, scale2) {
    fromRotationTranslationScale(this, q, pos, scale2);
    return this;
  }
  getRotation(q) {
    getRotation(q, this);
    return this;
  }
  getTranslation(pos) {
    getTranslation(pos, this);
    return this;
  }
  getScaling(scale2) {
    getScaling(scale2, this);
    return this;
  }
  getMaxScaleOnAxis() {
    return getMaxScaleOnAxis(this);
  }
  lookAt(eye, target, up) {
    targetTo(this, eye, target, up);
    return this;
  }
  determinant() {
    return determinant(this);
  }
  fromArray(a, o = 0) {
    this[0] = a[o];
    this[1] = a[o + 1];
    this[2] = a[o + 2];
    this[3] = a[o + 3];
    this[4] = a[o + 4];
    this[5] = a[o + 5];
    this[6] = a[o + 6];
    this[7] = a[o + 7];
    this[8] = a[o + 8];
    this[9] = a[o + 9];
    this[10] = a[o + 10];
    this[11] = a[o + 11];
    this[12] = a[o + 12];
    this[13] = a[o + 13];
    this[14] = a[o + 14];
    this[15] = a[o + 15];
    return this;
  }
  toArray(a = [], o = 0) {
    a[o] = this[0];
    a[o + 1] = this[1];
    a[o + 2] = this[2];
    a[o + 3] = this[3];
    a[o + 4] = this[4];
    a[o + 5] = this[5];
    a[o + 6] = this[6];
    a[o + 7] = this[7];
    a[o + 8] = this[8];
    a[o + 9] = this[9];
    a[o + 10] = this[10];
    a[o + 11] = this[11];
    a[o + 12] = this[12];
    a[o + 13] = this[13];
    a[o + 14] = this[14];
    a[o + 15] = this[15];
    return a;
  }
};
function fromRotationMatrix(out, m, order = "YXZ") {
  if (order === "XYZ") {
    out[1] = Math.asin(Math.min(Math.max(m[8], -1), 1));
    if (Math.abs(m[8]) < 0.99999) {
      out[0] = Math.atan2(-m[9], m[10]);
      out[2] = Math.atan2(-m[4], m[0]);
    } else {
      out[0] = Math.atan2(m[6], m[5]);
      out[2] = 0;
    }
  } else if (order === "YXZ") {
    out[0] = Math.asin(-Math.min(Math.max(m[9], -1), 1));
    if (Math.abs(m[9]) < 0.99999) {
      out[1] = Math.atan2(m[8], m[10]);
      out[2] = Math.atan2(m[1], m[5]);
    } else {
      out[1] = Math.atan2(-m[2], m[0]);
      out[2] = 0;
    }
  } else if (order === "ZXY") {
    out[0] = Math.asin(Math.min(Math.max(m[6], -1), 1));
    if (Math.abs(m[6]) < 0.99999) {
      out[1] = Math.atan2(-m[2], m[10]);
      out[2] = Math.atan2(-m[4], m[5]);
    } else {
      out[1] = 0;
      out[2] = Math.atan2(m[1], m[0]);
    }
  } else if (order === "ZYX") {
    out[1] = Math.asin(-Math.min(Math.max(m[2], -1), 1));
    if (Math.abs(m[2]) < 0.99999) {
      out[0] = Math.atan2(m[6], m[10]);
      out[2] = Math.atan2(m[1], m[0]);
    } else {
      out[0] = 0;
      out[2] = Math.atan2(-m[4], m[5]);
    }
  } else if (order === "YZX") {
    out[2] = Math.asin(Math.min(Math.max(m[1], -1), 1));
    if (Math.abs(m[1]) < 0.99999) {
      out[0] = Math.atan2(-m[9], m[5]);
      out[1] = Math.atan2(-m[2], m[0]);
    } else {
      out[0] = 0;
      out[1] = Math.atan2(m[8], m[10]);
    }
  } else if (order === "XZY") {
    out[2] = Math.asin(-Math.min(Math.max(m[4], -1), 1));
    if (Math.abs(m[4]) < 0.99999) {
      out[0] = Math.atan2(m[6], m[5]);
      out[1] = Math.atan2(m[8], m[0]);
    } else {
      out[0] = Math.atan2(-m[9], m[10]);
      out[1] = 0;
    }
  }
  return out;
}
var tmpMat4 = new Mat4();
var Euler = class extends Array {
  constructor(x = 0, y = x, z = x, order = "YXZ") {
    super(x, y, z);
    this.order = order;
    this.onChange = () => {
    };
    return this;
  }
  get x() {
    return this[0];
  }
  get y() {
    return this[1];
  }
  get z() {
    return this[2];
  }
  set x(v) {
    this[0] = v;
    this.onChange();
  }
  set y(v) {
    this[1] = v;
    this.onChange();
  }
  set z(v) {
    this[2] = v;
    this.onChange();
  }
  set(x, y = x, z = x) {
    if (x.length)
      return this.copy(x);
    this[0] = x;
    this[1] = y;
    this[2] = z;
    this.onChange();
    return this;
  }
  copy(v) {
    this[0] = v[0];
    this[1] = v[1];
    this[2] = v[2];
    this.onChange();
    return this;
  }
  reorder(order) {
    this.order = order;
    this.onChange();
    return this;
  }
  fromRotationMatrix(m, order = this.order) {
    fromRotationMatrix(this, m, order);
    return this;
  }
  fromQuaternion(q, order = this.order) {
    tmpMat4.fromQuaternion(q);
    return this.fromRotationMatrix(tmpMat4, order);
  }
  toArray(a = [], o = 0) {
    a[o] = this[0];
    a[o + 1] = this[1];
    a[o + 2] = this[2];
    return a;
  }
};
var Transform = class {
  constructor() {
    this.parent = null;
    this.children = [];
    this.visible = true;
    this.matrix = new Mat4();
    this.worldMatrix = new Mat4();
    this.matrixAutoUpdate = true;
    this.position = new Vec3();
    this.quaternion = new Quat();
    this.scale = new Vec3(1);
    this.rotation = new Euler();
    this.up = new Vec3(0, 1, 0);
    this.rotation.onChange = () => this.quaternion.fromEuler(this.rotation);
    this.quaternion.onChange = () => this.rotation.fromQuaternion(this.quaternion);
  }
  setParent(parent, notifyParent = true) {
    if (this.parent && parent !== this.parent)
      this.parent.removeChild(this, false);
    this.parent = parent;
    if (notifyParent && parent)
      parent.addChild(this, false);
  }
  addChild(child, notifyChild = true) {
    if (!~this.children.indexOf(child))
      this.children.push(child);
    if (notifyChild)
      child.setParent(this, false);
  }
  removeChild(child, notifyChild = true) {
    if (!!~this.children.indexOf(child))
      this.children.splice(this.children.indexOf(child), 1);
    if (notifyChild)
      child.setParent(null, false);
  }
  updateMatrixWorld(force) {
    if (this.matrixAutoUpdate)
      this.updateMatrix();
    if (this.worldMatrixNeedsUpdate || force) {
      if (this.parent === null)
        this.worldMatrix.copy(this.matrix);
      else
        this.worldMatrix.multiply(this.parent.worldMatrix, this.matrix);
      this.worldMatrixNeedsUpdate = false;
      force = true;
    }
    for (let i = 0, l = this.children.length; i < l; i++) {
      this.children[i].updateMatrixWorld(force);
    }
  }
  updateMatrix() {
    this.matrix.compose(this.quaternion, this.position, this.scale);
    this.worldMatrixNeedsUpdate = true;
  }
  traverse(callback) {
    if (callback(this))
      return;
    for (let i = 0, l = this.children.length; i < l; i++) {
      this.children[i].traverse(callback);
    }
  }
  decompose() {
    this.matrix.getTranslation(this.position);
    this.matrix.getRotation(this.quaternion);
    this.matrix.getScaling(this.scale);
    this.rotation.fromQuaternion(this.quaternion);
  }
  lookAt(target, invert2 = false) {
    if (invert2)
      this.matrix.lookAt(this.position, target, this.up);
    else
      this.matrix.lookAt(target, this.position, this.up);
    this.matrix.getRotation(this.quaternion);
    this.rotation.fromQuaternion(this.quaternion);
  }
};
var tempMat4$1 = new Mat4();
var tempVec3a = new Vec3();
var tempVec3b = new Vec3();
var Camera = class extends Transform {
  constructor(gl, { near = 0.1, far = 100, fov = 45, aspect = 1, left, right, bottom, top, zoom = 1 } = {}) {
    super();
    Object.assign(this, { near, far, fov, aspect, left, right, bottom, top, zoom });
    this.projectionMatrix = new Mat4();
    this.viewMatrix = new Mat4();
    this.projectionViewMatrix = new Mat4();
    this.worldPosition = new Vec3();
    this.type = left || right ? "orthographic" : "perspective";
    if (this.type === "orthographic")
      this.orthographic();
    else
      this.perspective();
  }
  perspective({ near = this.near, far = this.far, fov = this.fov, aspect = this.aspect } = {}) {
    Object.assign(this, { near, far, fov, aspect });
    this.projectionMatrix.fromPerspective({ fov: fov * (Math.PI / 180), aspect, near, far });
    this.type = "perspective";
    return this;
  }
  orthographic({
    near = this.near,
    far = this.far,
    left = this.left,
    right = this.right,
    bottom = this.bottom,
    top = this.top,
    zoom = this.zoom
  } = {}) {
    Object.assign(this, { near, far, left, right, bottom, top, zoom });
    left /= zoom;
    right /= zoom;
    bottom /= zoom;
    top /= zoom;
    this.projectionMatrix.fromOrthogonal({ left, right, bottom, top, near, far });
    this.type = "orthographic";
    return this;
  }
  updateMatrixWorld() {
    super.updateMatrixWorld();
    this.viewMatrix.inverse(this.worldMatrix);
    this.worldMatrix.getTranslation(this.worldPosition);
    this.projectionViewMatrix.multiply(this.projectionMatrix, this.viewMatrix);
    return this;
  }
  lookAt(target) {
    super.lookAt(target, true);
    return this;
  }
  project(v) {
    v.applyMatrix4(this.viewMatrix);
    v.applyMatrix4(this.projectionMatrix);
    return this;
  }
  unproject(v) {
    v.applyMatrix4(tempMat4$1.inverse(this.projectionMatrix));
    v.applyMatrix4(this.worldMatrix);
    return this;
  }
  updateFrustum() {
    if (!this.frustum) {
      this.frustum = [new Vec3(), new Vec3(), new Vec3(), new Vec3(), new Vec3(), new Vec3()];
    }
    const m = this.projectionViewMatrix;
    this.frustum[0].set(m[3] - m[0], m[7] - m[4], m[11] - m[8]).constant = m[15] - m[12];
    this.frustum[1].set(m[3] + m[0], m[7] + m[4], m[11] + m[8]).constant = m[15] + m[12];
    this.frustum[2].set(m[3] + m[1], m[7] + m[5], m[11] + m[9]).constant = m[15] + m[13];
    this.frustum[3].set(m[3] - m[1], m[7] - m[5], m[11] - m[9]).constant = m[15] - m[13];
    this.frustum[4].set(m[3] - m[2], m[7] - m[6], m[11] - m[10]).constant = m[15] - m[14];
    this.frustum[5].set(m[3] + m[2], m[7] + m[6], m[11] + m[10]).constant = m[15] + m[14];
    for (let i = 0; i < 6; i++) {
      const invLen = 1 / this.frustum[i].distance();
      this.frustum[i].multiply(invLen);
      this.frustum[i].constant *= invLen;
    }
  }
  frustumIntersectsMesh(node) {
    if (!node.geometry.attributes.position)
      return true;
    if (!node.geometry.bounds || node.geometry.bounds.radius === Infinity)
      node.geometry.computeBoundingSphere();
    if (!node.geometry.bounds)
      return true;
    const center = tempVec3a;
    center.copy(node.geometry.bounds.center);
    center.applyMatrix4(node.worldMatrix);
    const radius = node.geometry.bounds.radius * node.worldMatrix.getMaxScaleOnAxis();
    return this.frustumIntersectsSphere(center, radius);
  }
  frustumIntersectsSphere(center, radius) {
    const normal = tempVec3b;
    for (let i = 0; i < 6; i++) {
      const plane = this.frustum[i];
      const distance2 = normal.copy(plane).dot(center) + plane.constant;
      if (distance2 < -radius)
        return false;
    }
    return true;
  }
};
function fromMat4(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[4];
  out[4] = a[5];
  out[5] = a[6];
  out[6] = a[8];
  out[7] = a[9];
  out[8] = a[10];
  return out;
}
function fromQuat(out, q) {
  let x = q[0], y = q[1], z = q[2], w = q[3];
  let x2 = x + x;
  let y2 = y + y;
  let z2 = z + z;
  let xx = x * x2;
  let yx = y * x2;
  let yy = y * y2;
  let zx = z * x2;
  let zy = z * y2;
  let zz = z * z2;
  let wx = w * x2;
  let wy = w * y2;
  let wz = w * z2;
  out[0] = 1 - yy - zz;
  out[3] = yx - wz;
  out[6] = zx + wy;
  out[1] = yx + wz;
  out[4] = 1 - xx - zz;
  out[7] = zy - wx;
  out[2] = zx - wy;
  out[5] = zy + wx;
  out[8] = 1 - xx - yy;
  return out;
}
function copy$1(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a[4];
  out[5] = a[5];
  out[6] = a[6];
  out[7] = a[7];
  out[8] = a[8];
  return out;
}
function set$1(out, m00, m01, m02, m10, m11, m12, m20, m21, m22) {
  out[0] = m00;
  out[1] = m01;
  out[2] = m02;
  out[3] = m10;
  out[4] = m11;
  out[5] = m12;
  out[6] = m20;
  out[7] = m21;
  out[8] = m22;
  return out;
}
function identity$1(out) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 1;
  out[5] = 0;
  out[6] = 0;
  out[7] = 0;
  out[8] = 1;
  return out;
}
function invert(out, a) {
  let a00 = a[0], a01 = a[1], a02 = a[2];
  let a10 = a[3], a11 = a[4], a12 = a[5];
  let a20 = a[6], a21 = a[7], a22 = a[8];
  let b01 = a22 * a11 - a12 * a21;
  let b11 = -a22 * a10 + a12 * a20;
  let b21 = a21 * a10 - a11 * a20;
  let det = a00 * b01 + a01 * b11 + a02 * b21;
  if (!det) {
    return null;
  }
  det = 1 / det;
  out[0] = b01 * det;
  out[1] = (-a22 * a01 + a02 * a21) * det;
  out[2] = (a12 * a01 - a02 * a11) * det;
  out[3] = b11 * det;
  out[4] = (a22 * a00 - a02 * a20) * det;
  out[5] = (-a12 * a00 + a02 * a10) * det;
  out[6] = b21 * det;
  out[7] = (-a21 * a00 + a01 * a20) * det;
  out[8] = (a11 * a00 - a01 * a10) * det;
  return out;
}
function multiply$1(out, a, b) {
  let a00 = a[0], a01 = a[1], a02 = a[2];
  let a10 = a[3], a11 = a[4], a12 = a[5];
  let a20 = a[6], a21 = a[7], a22 = a[8];
  let b00 = b[0], b01 = b[1], b02 = b[2];
  let b10 = b[3], b11 = b[4], b12 = b[5];
  let b20 = b[6], b21 = b[7], b22 = b[8];
  out[0] = b00 * a00 + b01 * a10 + b02 * a20;
  out[1] = b00 * a01 + b01 * a11 + b02 * a21;
  out[2] = b00 * a02 + b01 * a12 + b02 * a22;
  out[3] = b10 * a00 + b11 * a10 + b12 * a20;
  out[4] = b10 * a01 + b11 * a11 + b12 * a21;
  out[5] = b10 * a02 + b11 * a12 + b12 * a22;
  out[6] = b20 * a00 + b21 * a10 + b22 * a20;
  out[7] = b20 * a01 + b21 * a11 + b22 * a21;
  out[8] = b20 * a02 + b21 * a12 + b22 * a22;
  return out;
}
function translate(out, a, v) {
  let a00 = a[0], a01 = a[1], a02 = a[2], a10 = a[3], a11 = a[4], a12 = a[5], a20 = a[6], a21 = a[7], a22 = a[8], x = v[0], y = v[1];
  out[0] = a00;
  out[1] = a01;
  out[2] = a02;
  out[3] = a10;
  out[4] = a11;
  out[5] = a12;
  out[6] = x * a00 + y * a10 + a20;
  out[7] = x * a01 + y * a11 + a21;
  out[8] = x * a02 + y * a12 + a22;
  return out;
}
function rotate(out, a, rad) {
  let a00 = a[0], a01 = a[1], a02 = a[2], a10 = a[3], a11 = a[4], a12 = a[5], a20 = a[6], a21 = a[7], a22 = a[8], s2 = Math.sin(rad), c = Math.cos(rad);
  out[0] = c * a00 + s2 * a10;
  out[1] = c * a01 + s2 * a11;
  out[2] = c * a02 + s2 * a12;
  out[3] = c * a10 - s2 * a00;
  out[4] = c * a11 - s2 * a01;
  out[5] = c * a12 - s2 * a02;
  out[6] = a20;
  out[7] = a21;
  out[8] = a22;
  return out;
}
function scale$1(out, a, v) {
  let x = v[0], y = v[1];
  out[0] = x * a[0];
  out[1] = x * a[1];
  out[2] = x * a[2];
  out[3] = y * a[3];
  out[4] = y * a[4];
  out[5] = y * a[5];
  out[6] = a[6];
  out[7] = a[7];
  out[8] = a[8];
  return out;
}
function normalFromMat4(out, a) {
  let a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
  let a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
  let a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
  let a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
  let b00 = a00 * a11 - a01 * a10;
  let b01 = a00 * a12 - a02 * a10;
  let b02 = a00 * a13 - a03 * a10;
  let b03 = a01 * a12 - a02 * a11;
  let b04 = a01 * a13 - a03 * a11;
  let b05 = a02 * a13 - a03 * a12;
  let b06 = a20 * a31 - a21 * a30;
  let b07 = a20 * a32 - a22 * a30;
  let b08 = a20 * a33 - a23 * a30;
  let b09 = a21 * a32 - a22 * a31;
  let b10 = a21 * a33 - a23 * a31;
  let b11 = a22 * a33 - a23 * a32;
  let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
  if (!det) {
    return null;
  }
  det = 1 / det;
  out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
  out[1] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
  out[2] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
  out[3] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
  out[4] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
  out[5] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
  out[6] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
  out[7] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
  out[8] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
  return out;
}
var Mat3 = class extends Array {
  constructor(m00 = 1, m01 = 0, m02 = 0, m10 = 0, m11 = 1, m12 = 0, m20 = 0, m21 = 0, m22 = 1) {
    super(m00, m01, m02, m10, m11, m12, m20, m21, m22);
    return this;
  }
  set(m00, m01, m02, m10, m11, m12, m20, m21, m22) {
    if (m00.length)
      return this.copy(m00);
    set$1(this, m00, m01, m02, m10, m11, m12, m20, m21, m22);
    return this;
  }
  translate(v, m = this) {
    translate(this, m, v);
    return this;
  }
  rotate(v, m = this) {
    rotate(this, m, v);
    return this;
  }
  scale(v, m = this) {
    scale$1(this, m, v);
    return this;
  }
  multiply(ma, mb) {
    if (mb) {
      multiply$1(this, ma, mb);
    } else {
      multiply$1(this, this, ma);
    }
    return this;
  }
  identity() {
    identity$1(this);
    return this;
  }
  copy(m) {
    copy$1(this, m);
    return this;
  }
  fromMatrix4(m) {
    fromMat4(this, m);
    return this;
  }
  fromQuaternion(q) {
    fromQuat(this, q);
    return this;
  }
  fromBasis(vec3a, vec3b, vec3c) {
    this.set(vec3a[0], vec3a[1], vec3a[2], vec3b[0], vec3b[1], vec3b[2], vec3c[0], vec3c[1], vec3c[2]);
    return this;
  }
  inverse(m = this) {
    invert(this, m);
    return this;
  }
  getNormalMatrix(m) {
    normalFromMat4(this, m);
    return this;
  }
};
var ID$1 = 0;
var Mesh = class extends Transform {
  constructor(gl, { geometry, program, mode = gl.TRIANGLES, frustumCulled = true, renderOrder = 0 } = {}) {
    super();
    if (!gl.canvas)
      console.error("gl not passed as first argument to Mesh");
    this.gl = gl;
    this.id = ID$1++;
    this.geometry = geometry;
    this.program = program;
    this.mode = mode;
    this.frustumCulled = frustumCulled;
    this.renderOrder = renderOrder;
    this.modelViewMatrix = new Mat4();
    this.normalMatrix = new Mat3();
    this.beforeRenderCallbacks = [];
    this.afterRenderCallbacks = [];
  }
  onBeforeRender(f) {
    this.beforeRenderCallbacks.push(f);
    return this;
  }
  onAfterRender(f) {
    this.afterRenderCallbacks.push(f);
    return this;
  }
  draw({ camera } = {}) {
    this.beforeRenderCallbacks.forEach((f) => f && f({ mesh: this, camera }));
    if (camera) {
      if (!this.program.uniforms.modelMatrix) {
        Object.assign(this.program.uniforms, {
          modelMatrix: { value: null },
          viewMatrix: { value: null },
          modelViewMatrix: { value: null },
          normalMatrix: { value: null },
          projectionMatrix: { value: null },
          cameraPosition: { value: null }
        });
      }
      this.program.uniforms.projectionMatrix.value = camera.projectionMatrix;
      this.program.uniforms.cameraPosition.value = camera.worldPosition;
      this.program.uniforms.viewMatrix.value = camera.viewMatrix;
      this.modelViewMatrix.multiply(camera.viewMatrix, this.worldMatrix);
      this.normalMatrix.getNormalMatrix(this.modelViewMatrix);
      this.program.uniforms.modelMatrix.value = this.worldMatrix;
      this.program.uniforms.modelViewMatrix.value = this.modelViewMatrix;
      this.program.uniforms.normalMatrix.value = this.normalMatrix;
    }
    let flipFaces = this.program.cullFace && this.worldMatrix.determinant() < 0;
    this.program.use({ flipFaces });
    this.geometry.draw({ mode: this.mode, program: this.program });
    this.afterRenderCallbacks.forEach((f) => f && f({ mesh: this, camera }));
  }
};
var emptyPixel = new Uint8Array(4);
function isPowerOf2(value) {
  return (value & value - 1) === 0;
}
var ID = 1;
var Texture = class {
  constructor(gl, {
    image,
    target = gl.TEXTURE_2D,
    type = gl.UNSIGNED_BYTE,
    format: format2 = gl.RGBA,
    internalFormat = format2,
    wrapS = gl.CLAMP_TO_EDGE,
    wrapT = gl.CLAMP_TO_EDGE,
    generateMipmaps = true,
    minFilter = generateMipmaps ? gl.NEAREST_MIPMAP_LINEAR : gl.LINEAR,
    magFilter = gl.LINEAR,
    premultiplyAlpha = false,
    unpackAlignment = 4,
    flipY = target == gl.TEXTURE_2D ? true : false,
    anisotropy = 0,
    level = 0,
    width,
    height = width
  } = {}) {
    this.gl = gl;
    this.id = ID++;
    this.image = image;
    this.target = target;
    this.type = type;
    this.format = format2;
    this.internalFormat = internalFormat;
    this.minFilter = minFilter;
    this.magFilter = magFilter;
    this.wrapS = wrapS;
    this.wrapT = wrapT;
    this.generateMipmaps = generateMipmaps;
    this.premultiplyAlpha = premultiplyAlpha;
    this.unpackAlignment = unpackAlignment;
    this.flipY = flipY;
    this.anisotropy = Math.min(anisotropy, this.gl.renderer.parameters.maxAnisotropy);
    this.level = level;
    this.width = width;
    this.height = height;
    this.texture = this.gl.createTexture();
    this.store = {
      image: null
    };
    this.glState = this.gl.renderer.state;
    this.state = {};
    this.state.minFilter = this.gl.NEAREST_MIPMAP_LINEAR;
    this.state.magFilter = this.gl.LINEAR;
    this.state.wrapS = this.gl.REPEAT;
    this.state.wrapT = this.gl.REPEAT;
    this.state.anisotropy = 0;
  }
  bind() {
    if (this.glState.textureUnits[this.glState.activeTextureUnit] === this.id)
      return;
    this.gl.bindTexture(this.target, this.texture);
    this.glState.textureUnits[this.glState.activeTextureUnit] = this.id;
  }
  update(textureUnit = 0) {
    const needsUpdate = !(this.image === this.store.image && !this.needsUpdate);
    if (needsUpdate || this.glState.textureUnits[textureUnit] !== this.id) {
      this.gl.renderer.activeTexture(textureUnit);
      this.bind();
    }
    if (!needsUpdate)
      return;
    this.needsUpdate = false;
    if (this.flipY !== this.glState.flipY) {
      this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, this.flipY);
      this.glState.flipY = this.flipY;
    }
    if (this.premultiplyAlpha !== this.glState.premultiplyAlpha) {
      this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, this.premultiplyAlpha);
      this.glState.premultiplyAlpha = this.premultiplyAlpha;
    }
    if (this.unpackAlignment !== this.glState.unpackAlignment) {
      this.gl.pixelStorei(this.gl.UNPACK_ALIGNMENT, this.unpackAlignment);
      this.glState.unpackAlignment = this.unpackAlignment;
    }
    if (this.minFilter !== this.state.minFilter) {
      this.gl.texParameteri(this.target, this.gl.TEXTURE_MIN_FILTER, this.minFilter);
      this.state.minFilter = this.minFilter;
    }
    if (this.magFilter !== this.state.magFilter) {
      this.gl.texParameteri(this.target, this.gl.TEXTURE_MAG_FILTER, this.magFilter);
      this.state.magFilter = this.magFilter;
    }
    if (this.wrapS !== this.state.wrapS) {
      this.gl.texParameteri(this.target, this.gl.TEXTURE_WRAP_S, this.wrapS);
      this.state.wrapS = this.wrapS;
    }
    if (this.wrapT !== this.state.wrapT) {
      this.gl.texParameteri(this.target, this.gl.TEXTURE_WRAP_T, this.wrapT);
      this.state.wrapT = this.wrapT;
    }
    if (this.anisotropy && this.anisotropy !== this.state.anisotropy) {
      this.gl.texParameterf(this.target, this.gl.renderer.getExtension("EXT_texture_filter_anisotropic").TEXTURE_MAX_ANISOTROPY_EXT, this.anisotropy);
      this.state.anisotropy = this.anisotropy;
    }
    if (this.image) {
      if (this.image.width) {
        this.width = this.image.width;
        this.height = this.image.height;
      }
      if (this.target === this.gl.TEXTURE_CUBE_MAP) {
        for (let i = 0; i < 6; i++) {
          this.gl.texImage2D(this.gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, this.level, this.internalFormat, this.format, this.type, this.image[i]);
        }
      } else if (ArrayBuffer.isView(this.image)) {
        this.gl.texImage2D(this.target, this.level, this.internalFormat, this.width, this.height, 0, this.format, this.type, this.image);
      } else if (this.image.isCompressedTexture) {
        for (let level = 0; level < this.image.length; level++) {
          this.gl.compressedTexImage2D(this.target, level, this.internalFormat, this.image[level].width, this.image[level].height, 0, this.image[level].data);
        }
      } else {
        this.gl.texImage2D(this.target, this.level, this.internalFormat, this.format, this.type, this.image);
      }
      if (this.generateMipmaps) {
        if (!this.gl.renderer.isWebgl2 && (!isPowerOf2(this.image.width) || !isPowerOf2(this.image.height))) {
          this.generateMipmaps = false;
          this.wrapS = this.wrapT = this.gl.CLAMP_TO_EDGE;
          this.minFilter = this.gl.LINEAR;
        } else {
          this.gl.generateMipmap(this.target);
        }
      }
      this.onUpdate && this.onUpdate();
    } else {
      if (this.target === this.gl.TEXTURE_CUBE_MAP) {
        for (let i = 0; i < 6; i++) {
          this.gl.texImage2D(this.gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, this.gl.RGBA, 1, 1, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, emptyPixel);
        }
      } else if (this.width) {
        this.gl.texImage2D(this.target, this.level, this.internalFormat, this.width, this.height, 0, this.format, this.type, null);
      } else {
        this.gl.texImage2D(this.target, 0, this.gl.RGBA, 1, 1, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, emptyPixel);
      }
    }
    this.store.image = this.image;
  }
};
var RenderTarget = class {
  constructor(gl, {
    width = gl.canvas.width,
    height = gl.canvas.height,
    target = gl.FRAMEBUFFER,
    color = 1,
    depth = true,
    stencil = false,
    depthTexture = false,
    wrapS = gl.CLAMP_TO_EDGE,
    wrapT = gl.CLAMP_TO_EDGE,
    minFilter = gl.LINEAR,
    magFilter = minFilter,
    type = gl.UNSIGNED_BYTE,
    format: format2 = gl.RGBA,
    internalFormat = format2,
    unpackAlignment,
    premultiplyAlpha
  } = {}) {
    this.gl = gl;
    this.width = width;
    this.height = height;
    this.depth = depth;
    this.buffer = this.gl.createFramebuffer();
    this.target = target;
    this.gl.bindFramebuffer(this.target, this.buffer);
    this.textures = [];
    const drawBuffers = [];
    for (let i = 0; i < color; i++) {
      this.textures.push(new Texture(gl, {
        width,
        height,
        wrapS,
        wrapT,
        minFilter,
        magFilter,
        type,
        format: format2,
        internalFormat,
        unpackAlignment,
        premultiplyAlpha,
        flipY: false,
        generateMipmaps: false
      }));
      this.textures[i].update();
      this.gl.framebufferTexture2D(this.target, this.gl.COLOR_ATTACHMENT0 + i, this.gl.TEXTURE_2D, this.textures[i].texture, 0);
      drawBuffers.push(this.gl.COLOR_ATTACHMENT0 + i);
    }
    if (drawBuffers.length > 1)
      this.gl.renderer.drawBuffers(drawBuffers);
    this.texture = this.textures[0];
    if (depthTexture && (this.gl.renderer.isWebgl2 || this.gl.renderer.getExtension("WEBGL_depth_texture"))) {
      this.depthTexture = new Texture(gl, {
        width,
        height,
        minFilter: this.gl.NEAREST,
        magFilter: this.gl.NEAREST,
        format: this.gl.DEPTH_COMPONENT,
        internalFormat: gl.renderer.isWebgl2 ? this.gl.DEPTH_COMPONENT16 : this.gl.DEPTH_COMPONENT,
        type: this.gl.UNSIGNED_INT
      });
      this.depthTexture.update();
      this.gl.framebufferTexture2D(this.target, this.gl.DEPTH_ATTACHMENT, this.gl.TEXTURE_2D, this.depthTexture.texture, 0);
    } else {
      if (depth && !stencil) {
        this.depthBuffer = this.gl.createRenderbuffer();
        this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.depthBuffer);
        this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, width, height);
        this.gl.framebufferRenderbuffer(this.target, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, this.depthBuffer);
      }
      if (stencil && !depth) {
        this.stencilBuffer = this.gl.createRenderbuffer();
        this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.stencilBuffer);
        this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.STENCIL_INDEX8, width, height);
        this.gl.framebufferRenderbuffer(this.target, this.gl.STENCIL_ATTACHMENT, this.gl.RENDERBUFFER, this.stencilBuffer);
      }
      if (depth && stencil) {
        this.depthStencilBuffer = this.gl.createRenderbuffer();
        this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.depthStencilBuffer);
        this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_STENCIL, width, height);
        this.gl.framebufferRenderbuffer(this.target, this.gl.DEPTH_STENCIL_ATTACHMENT, this.gl.RENDERBUFFER, this.depthStencilBuffer);
      }
    }
    this.gl.bindFramebuffer(this.target, null);
  }
};
function copy(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  return out;
}
function set(out, x, y) {
  out[0] = x;
  out[1] = y;
  return out;
}
function add(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  return out;
}
function subtract(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  return out;
}
function multiply(out, a, b) {
  out[0] = a[0] * b[0];
  out[1] = a[1] * b[1];
  return out;
}
function divide(out, a, b) {
  out[0] = a[0] / b[0];
  out[1] = a[1] / b[1];
  return out;
}
function scale(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  return out;
}
function distance(a, b) {
  var x = b[0] - a[0], y = b[1] - a[1];
  return Math.sqrt(x * x + y * y);
}
function squaredDistance(a, b) {
  var x = b[0] - a[0], y = b[1] - a[1];
  return x * x + y * y;
}
function length(a) {
  var x = a[0], y = a[1];
  return Math.sqrt(x * x + y * y);
}
function squaredLength(a) {
  var x = a[0], y = a[1];
  return x * x + y * y;
}
function negate(out, a) {
  out[0] = -a[0];
  out[1] = -a[1];
  return out;
}
function inverse(out, a) {
  out[0] = 1 / a[0];
  out[1] = 1 / a[1];
  return out;
}
function normalize2(out, a) {
  var x = a[0], y = a[1];
  var len = x * x + y * y;
  if (len > 0) {
    len = 1 / Math.sqrt(len);
  }
  out[0] = a[0] * len;
  out[1] = a[1] * len;
  return out;
}
function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1];
}
function cross(a, b) {
  return a[0] * b[1] - a[1] * b[0];
}
function lerp(out, a, b, t) {
  var ax = a[0], ay = a[1];
  out[0] = ax + t * (b[0] - ax);
  out[1] = ay + t * (b[1] - ay);
  return out;
}
function transformMat3(out, a, m) {
  var x = a[0], y = a[1];
  out[0] = m[0] * x + m[3] * y + m[6];
  out[1] = m[1] * x + m[4] * y + m[7];
  return out;
}
function transformMat4(out, a, m) {
  let x = a[0];
  let y = a[1];
  out[0] = m[0] * x + m[4] * y + m[12];
  out[1] = m[1] * x + m[5] * y + m[13];
  return out;
}
function exactEquals(a, b) {
  return a[0] === b[0] && a[1] === b[1];
}
var Vec2 = class extends Array {
  constructor(x = 0, y = x) {
    super(x, y);
    return this;
  }
  get x() {
    return this[0];
  }
  get y() {
    return this[1];
  }
  set x(v) {
    this[0] = v;
  }
  set y(v) {
    this[1] = v;
  }
  set(x, y = x) {
    if (x.length)
      return this.copy(x);
    set(this, x, y);
    return this;
  }
  copy(v) {
    copy(this, v);
    return this;
  }
  add(va, vb) {
    if (vb)
      add(this, va, vb);
    else
      add(this, this, va);
    return this;
  }
  sub(va, vb) {
    if (vb)
      subtract(this, va, vb);
    else
      subtract(this, this, va);
    return this;
  }
  multiply(v) {
    if (v.length)
      multiply(this, this, v);
    else
      scale(this, this, v);
    return this;
  }
  divide(v) {
    if (v.length)
      divide(this, this, v);
    else
      scale(this, this, 1 / v);
    return this;
  }
  inverse(v = this) {
    inverse(this, v);
    return this;
  }
  len() {
    return length(this);
  }
  distance(v) {
    if (v)
      return distance(this, v);
    else
      return length(this);
  }
  squaredLen() {
    return this.squaredDistance();
  }
  squaredDistance(v) {
    if (v)
      return squaredDistance(this, v);
    else
      return squaredLength(this);
  }
  negate(v = this) {
    negate(this, v);
    return this;
  }
  cross(va, vb) {
    if (vb)
      return cross(va, vb);
    return cross(this, va);
  }
  scale(v) {
    scale(this, this, v);
    return this;
  }
  normalize() {
    normalize2(this, this);
    return this;
  }
  dot(v) {
    return dot(this, v);
  }
  equals(v) {
    return exactEquals(this, v);
  }
  applyMatrix3(mat3) {
    transformMat3(this, this, mat3);
    return this;
  }
  applyMatrix4(mat4) {
    transformMat4(this, this, mat4);
    return this;
  }
  lerp(v, a) {
    lerp(this, this, v, a);
  }
  clone() {
    return new Vec2(this[0], this[1]);
  }
  fromArray(a, o = 0) {
    this[0] = a[o];
    this[1] = a[o + 1];
    return this;
  }
  toArray(a = [], o = 0) {
    a[o] = this[0];
    a[o + 1] = this[1];
    return a;
  }
};
var Triangle = class extends Geometry {
  constructor(gl, { attributes = {} } = {}) {
    Object.assign(attributes, {
      position: { size: 2, data: new Float32Array([-1, -1, 3, -1, -1, 3]) },
      uv: { size: 2, data: new Float32Array([0, 0, 2, 0, 0, 2]) }
    });
    super(gl, attributes);
  }
};
var Torus = class extends Geometry {
  constructor(gl, { radius = 0.5, tube = 0.2, radialSegments = 8, tubularSegments = 6, arc = Math.PI * 2, attributes = {} } = {}) {
    const num = (radialSegments + 1) * (tubularSegments + 1);
    const numIndices = radialSegments * tubularSegments * 6;
    const vertices = new Float32Array(num * 3);
    const normals = new Float32Array(num * 3);
    const uvs = new Float32Array(num * 2);
    const indices = num > 65536 ? new Uint32Array(numIndices) : new Uint16Array(numIndices);
    const center = new Vec3();
    const vertex2 = new Vec3();
    const normal = new Vec3();
    let idx = 0;
    for (let j = 0; j <= radialSegments; j++) {
      for (let i = 0; i <= tubularSegments; i++, idx++) {
        const u = i / tubularSegments * arc;
        const v = j / radialSegments * Math.PI * 2;
        vertex2.x = (radius + tube * Math.cos(v)) * Math.cos(u);
        vertex2.y = (radius + tube * Math.cos(v)) * Math.sin(u);
        vertex2.z = tube * Math.sin(v);
        vertices.set([vertex2.x, vertex2.y, vertex2.z], idx * 3);
        center.x = radius * Math.cos(u);
        center.y = radius * Math.sin(u);
        normal.sub(vertex2, center).normalize();
        normals.set([normal.x, normal.y, normal.z], idx * 3);
        uvs.set([i / tubularSegments, j / radialSegments], idx * 2);
      }
    }
    idx = 0;
    for (let j = 1; j <= radialSegments; j++) {
      for (let i = 1; i <= tubularSegments; i++, idx++) {
        const a = (tubularSegments + 1) * j + i - 1;
        const b = (tubularSegments + 1) * (j - 1) + i - 1;
        const c = (tubularSegments + 1) * (j - 1) + i;
        const d2 = (tubularSegments + 1) * j + i;
        indices.set([a, b, d2, b, c, d2], idx * 6);
      }
    }
    Object.assign(attributes, {
      position: { size: 3, data: vertices },
      normal: { size: 3, data: normals },
      uv: { size: 2, data: uvs },
      index: { data: indices }
    });
    super(gl, attributes);
  }
};
var STATE = { NONE: -1, ROTATE: 0, DOLLY: 1, PAN: 2, DOLLY_PAN: 3 };
var tempVec3 = new Vec3();
var tempVec2a = new Vec2();
var tempVec2b = new Vec2();
function Orbit(object, {
  element = document,
  enabled = true,
  target = new Vec3(),
  ease = 0.25,
  inertia = 0.85,
  enableRotate = true,
  rotateSpeed = 0.1,
  autoRotate = false,
  autoRotateSpeed = 1,
  enableZoom = true,
  zoomSpeed = 1,
  enablePan = true,
  panSpeed = 0.1,
  minPolarAngle = 0,
  maxPolarAngle = Math.PI,
  minAzimuthAngle = -Infinity,
  maxAzimuthAngle = Infinity,
  minDistance = 0,
  maxDistance = Infinity
} = {}) {
  this.enabled = enabled;
  this.target = target;
  ease = ease || 1;
  inertia = inertia || 0;
  this.minDistance = minDistance;
  this.maxDistance = maxDistance;
  const sphericalDelta = { radius: 1, phi: 0, theta: 0 };
  const sphericalTarget = { radius: 1, phi: 0, theta: 0 };
  const spherical = { radius: 1, phi: 0, theta: 0 };
  const panDelta = new Vec3();
  const offset = new Vec3();
  offset.copy(object.position).sub(this.target);
  spherical.radius = sphericalTarget.radius = offset.distance();
  spherical.theta = sphericalTarget.theta = Math.atan2(offset.x, offset.z);
  spherical.phi = sphericalTarget.phi = Math.acos(Math.min(Math.max(offset.y / sphericalTarget.radius, -1), 1));
  this.offset = offset;
  this.update = () => {
    if (autoRotate) {
      handleAutoRotate();
    }
    sphericalTarget.radius *= sphericalDelta.radius;
    sphericalTarget.theta += sphericalDelta.theta;
    sphericalTarget.phi += sphericalDelta.phi;
    sphericalTarget.theta = Math.max(minAzimuthAngle, Math.min(maxAzimuthAngle, sphericalTarget.theta));
    sphericalTarget.phi = Math.max(minPolarAngle, Math.min(maxPolarAngle, sphericalTarget.phi));
    sphericalTarget.radius = Math.max(this.minDistance, Math.min(this.maxDistance, sphericalTarget.radius));
    spherical.phi += (sphericalTarget.phi - spherical.phi) * ease;
    spherical.theta += (sphericalTarget.theta - spherical.theta) * ease;
    spherical.radius += (sphericalTarget.radius - spherical.radius) * ease;
    this.target.add(panDelta);
    let sinPhiRadius = spherical.radius * Math.sin(Math.max(1e-6, spherical.phi));
    offset.x = sinPhiRadius * Math.sin(spherical.theta);
    offset.y = spherical.radius * Math.cos(spherical.phi);
    offset.z = sinPhiRadius * Math.cos(spherical.theta);
    object.position.copy(this.target).add(offset);
    object.lookAt(this.target);
    sphericalDelta.theta *= inertia;
    sphericalDelta.phi *= inertia;
    panDelta.multiply(inertia);
    sphericalDelta.radius = 1;
  };
  this.forcePosition = () => {
    offset.copy(object.position).sub(this.target);
    spherical.radius = sphericalTarget.radius = offset.distance();
    spherical.theta = sphericalTarget.theta = Math.atan2(offset.x, offset.z);
    spherical.phi = sphericalTarget.phi = Math.acos(Math.min(Math.max(offset.y / sphericalTarget.radius, -1), 1));
    object.lookAt(this.target);
  };
  const rotateStart = new Vec2();
  const panStart = new Vec2();
  const dollyStart = new Vec2();
  let state = STATE.NONE;
  this.mouseButtons = { ORBIT: 0, ZOOM: 1, PAN: 2 };
  function getZoomScale() {
    return Math.pow(0.95, zoomSpeed);
  }
  function panLeft(distance2, m) {
    tempVec3.set(m[0], m[1], m[2]);
    tempVec3.multiply(-distance2);
    panDelta.add(tempVec3);
  }
  function panUp(distance2, m) {
    tempVec3.set(m[4], m[5], m[6]);
    tempVec3.multiply(distance2);
    panDelta.add(tempVec3);
  }
  const pan = (deltaX, deltaY) => {
    let el = element === document ? document.body : element;
    tempVec3.copy(object.position).sub(this.target);
    let targetDistance = tempVec3.distance();
    targetDistance *= Math.tan((object.fov || 45) / 2 * Math.PI / 180);
    panLeft(2 * deltaX * targetDistance / el.clientHeight, object.matrix);
    panUp(2 * deltaY * targetDistance / el.clientHeight, object.matrix);
  };
  function dolly(dollyScale) {
    sphericalDelta.radius /= dollyScale;
  }
  function handleAutoRotate() {
    const angle2 = 2 * Math.PI / 60 / 60 * autoRotateSpeed;
    sphericalDelta.theta -= angle2;
  }
  function handleMoveRotate(x, y) {
    tempVec2a.set(x, y);
    tempVec2b.sub(tempVec2a, rotateStart).multiply(rotateSpeed);
    let el = element === document ? document.body : element;
    sphericalDelta.theta -= 2 * Math.PI * tempVec2b.x / el.clientHeight;
    sphericalDelta.phi -= 2 * Math.PI * tempVec2b.y / el.clientHeight;
    rotateStart.copy(tempVec2a);
  }
  function handleMouseMoveDolly(e) {
    tempVec2a.set(e.clientX, e.clientY);
    tempVec2b.sub(tempVec2a, dollyStart);
    if (tempVec2b.y > 0) {
      dolly(getZoomScale());
    } else if (tempVec2b.y < 0) {
      dolly(1 / getZoomScale());
    }
    dollyStart.copy(tempVec2a);
  }
  function handleMovePan(x, y) {
    tempVec2a.set(x, y);
    tempVec2b.sub(tempVec2a, panStart).multiply(panSpeed);
    pan(tempVec2b.x, tempVec2b.y);
    panStart.copy(tempVec2a);
  }
  function handleTouchStartDollyPan(e) {
    if (enableZoom) {
      let dx = e.touches[0].pageX - e.touches[1].pageX;
      let dy = e.touches[0].pageY - e.touches[1].pageY;
      let distance2 = Math.sqrt(dx * dx + dy * dy);
      dollyStart.set(0, distance2);
    }
    if (enablePan) {
      let x = 0.5 * (e.touches[0].pageX + e.touches[1].pageX);
      let y = 0.5 * (e.touches[0].pageY + e.touches[1].pageY);
      panStart.set(x, y);
    }
  }
  function handleTouchMoveDollyPan(e) {
    if (enableZoom) {
      let dx = e.touches[0].pageX - e.touches[1].pageX;
      let dy = e.touches[0].pageY - e.touches[1].pageY;
      let distance2 = Math.sqrt(dx * dx + dy * dy);
      tempVec2a.set(0, distance2);
      tempVec2b.set(0, Math.pow(tempVec2a.y / dollyStart.y, zoomSpeed));
      dolly(tempVec2b.y);
      dollyStart.copy(tempVec2a);
    }
    if (enablePan) {
      let x = 0.5 * (e.touches[0].pageX + e.touches[1].pageX);
      let y = 0.5 * (e.touches[0].pageY + e.touches[1].pageY);
      handleMovePan(x, y);
    }
  }
  const onMouseDown = (e) => {
    if (!this.enabled)
      return;
    switch (e.button) {
      case this.mouseButtons.ORBIT:
        if (enableRotate === false)
          return;
        rotateStart.set(e.clientX, e.clientY);
        state = STATE.ROTATE;
        break;
      case this.mouseButtons.ZOOM:
        if (enableZoom === false)
          return;
        dollyStart.set(e.clientX, e.clientY);
        state = STATE.DOLLY;
        break;
      case this.mouseButtons.PAN:
        if (enablePan === false)
          return;
        panStart.set(e.clientX, e.clientY);
        state = STATE.PAN;
        break;
    }
    if (state !== STATE.NONE) {
      window.addEventListener("mousemove", onMouseMove, false);
      window.addEventListener("mouseup", onMouseUp, false);
    }
  };
  const onMouseMove = (e) => {
    if (!this.enabled)
      return;
    switch (state) {
      case STATE.ROTATE:
        if (enableRotate === false)
          return;
        handleMoveRotate(e.clientX, e.clientY);
        break;
      case STATE.DOLLY:
        if (enableZoom === false)
          return;
        handleMouseMoveDolly(e);
        break;
      case STATE.PAN:
        if (enablePan === false)
          return;
        handleMovePan(e.clientX, e.clientY);
        break;
    }
  };
  const onMouseUp = () => {
    window.removeEventListener("mousemove", onMouseMove, false);
    window.removeEventListener("mouseup", onMouseUp, false);
    state = STATE.NONE;
  };
  const onMouseWheel = (e) => {
    if (!this.enabled || !enableZoom || state !== STATE.NONE && state !== STATE.ROTATE)
      return;
    e.stopPropagation();
    e.preventDefault();
    if (e.deltaY < 0) {
      dolly(1 / getZoomScale());
    } else if (e.deltaY > 0) {
      dolly(getZoomScale());
    }
  };
  const onTouchStart = (e) => {
    if (!this.enabled)
      return;
    e.preventDefault();
    switch (e.touches.length) {
      case 1:
        if (enableRotate === false)
          return;
        rotateStart.set(e.touches[0].pageX, e.touches[0].pageY);
        state = STATE.ROTATE;
        break;
      case 2:
        if (enableZoom === false && enablePan === false)
          return;
        handleTouchStartDollyPan(e);
        state = STATE.DOLLY_PAN;
        break;
      default:
        state = STATE.NONE;
    }
  };
  const onTouchMove = (e) => {
    if (!this.enabled)
      return;
    e.preventDefault();
    e.stopPropagation();
    switch (e.touches.length) {
      case 1:
        if (enableRotate === false)
          return;
        handleMoveRotate(e.touches[0].pageX, e.touches[0].pageY);
        break;
      case 2:
        if (enableZoom === false && enablePan === false)
          return;
        handleTouchMoveDollyPan(e);
        break;
      default:
        state = STATE.NONE;
    }
  };
  const onTouchEnd = () => {
    if (!this.enabled)
      return;
    state = STATE.NONE;
  };
  const onContextMenu = (e) => {
    if (!this.enabled)
      return;
    e.preventDefault();
  };
  function addHandlers() {
    element.addEventListener("contextmenu", onContextMenu, false);
    element.addEventListener("mousedown", onMouseDown, false);
    element.addEventListener("wheel", onMouseWheel, { passive: false });
    element.addEventListener("touchstart", onTouchStart, { passive: false });
    element.addEventListener("touchend", onTouchEnd, false);
    element.addEventListener("touchmove", onTouchMove, { passive: false });
  }
  this.remove = function() {
    element.removeEventListener("contextmenu", onContextMenu);
    element.removeEventListener("mousedown", onMouseDown);
    element.removeEventListener("wheel", onMouseWheel);
    element.removeEventListener("touchstart", onTouchStart);
    element.removeEventListener("touchend", onTouchEnd);
    element.removeEventListener("touchmove", onTouchMove);
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  };
  addHandlers();
}
var vertex$7 = `
    precision highp float;
    precision highp int;

    attribute vec3 position;
    attribute vec3 normal;

    uniform mat3 normalMatrix;
    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;

    varying vec3 vNormal;

    void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;
var fragment$4 = `
    precision highp float;
    precision highp int;

    varying vec3 vNormal;

    void main() {
        gl_FragColor.rgb = normalize(vNormal);
        gl_FragColor.a = 1.0;
    }
`;
function NormalProgram(gl) {
  return new Program(gl, {
    vertex: vertex$7,
    fragment: fragment$4,
    cullFace: null
  });
}
var tmpVec3A = new Vec3();
var tmpVec3B = new Vec3();
var tmpVec3C = new Vec3();
var tmpVec3D = new Vec3();
var tmpQuatA = new Quat();
var tmpQuatB = new Quat();
var tmpQuatC = new Quat();
var tmpQuatD = new Quat();
var GLTFAnimation = class {
  constructor(data, weight = 1) {
    this.data = data;
    this.elapsed = 0;
    this.weight = weight;
    this.loop = true;
    this.startTime = data.reduce((a, { times }) => Math.min(a, times[0]), Infinity);
    this.endTime = data.reduce((a, { times }) => Math.max(a, times[times.length - 1]), 0);
    this.duration = this.endTime - this.startTime;
  }
  update(totalWeight = 1, isSet) {
    const weight = isSet ? 1 : this.weight / totalWeight;
    const elapsed = (this.loop ? this.elapsed % this.duration : Math.min(this.elapsed, this.duration - 1e-3)) + this.startTime;
    this.data.forEach(({ node, transform, interpolation, times, values }) => {
      const prevIndex = Math.max(1, times.findIndex((t) => t > elapsed)) - 1;
      const nextIndex = prevIndex + 1;
      let alpha = (elapsed - times[prevIndex]) / (times[nextIndex] - times[prevIndex]);
      if (interpolation === "STEP")
        alpha = 0;
      let prevVal = tmpVec3A;
      let prevTan = tmpVec3B;
      let nextTan = tmpVec3C;
      let nextVal = tmpVec3D;
      let size = 3;
      if (transform === "quaternion") {
        prevVal = tmpQuatA;
        prevTan = tmpQuatB;
        nextTan = tmpQuatC;
        nextVal = tmpQuatD;
        size = 4;
      }
      if (interpolation === "CUBICSPLINE") {
        prevVal.fromArray(values, prevIndex * size * 3 + size * 1);
        prevTan.fromArray(values, prevIndex * size * 3 + size * 2);
        nextTan.fromArray(values, nextIndex * size * 3 + size * 0);
        nextVal.fromArray(values, nextIndex * size * 3 + size * 1);
        prevVal = this.cubicSplineInterpolate(alpha, prevVal, prevTan, nextTan, nextVal);
        if (size === 4)
          prevVal.normalize();
      } else {
        prevVal.fromArray(values, prevIndex * size);
        nextVal.fromArray(values, nextIndex * size);
        if (size === 4)
          prevVal.slerp(nextVal, alpha);
        else
          prevVal.lerp(nextVal, alpha);
      }
      if (size === 4)
        node[transform].slerp(prevVal, weight);
      else
        node[transform].lerp(prevVal, weight);
    });
  }
  cubicSplineInterpolate(t, prevVal, prevTan, nextTan, nextVal) {
    const t2 = t * t;
    const t3 = t2 * t;
    const s2 = 3 * t2 - 2 * t3;
    const s3 = t3 - t2;
    const s0 = 1 - s2;
    const s1 = s3 - t2 + t;
    for (let i = 0; i < prevVal.length; i++) {
      prevVal[i] = s0 * prevVal[i] + s1 * (1 - t) * prevTan[i] + s2 * nextVal[i] + s3 * t * nextTan[i];
    }
    return prevVal;
  }
};
var tempMat4 = new Mat4();
var identity = new Mat4();
var GLTFSkin = class extends Mesh {
  constructor(gl, { skeleton, geometry, program, mode = gl.TRIANGLES } = {}) {
    super(gl, { geometry, program, mode });
    this.skeleton = skeleton;
    this.program = program;
    this.createBoneTexture();
    this.animations = [];
  }
  createBoneTexture() {
    if (!this.skeleton.joints.length)
      return;
    const size = Math.max(4, Math.pow(2, Math.ceil(Math.log(Math.sqrt(this.skeleton.joints.length * 4)) / Math.LN2)));
    this.boneMatrices = new Float32Array(size * size * 4);
    this.boneTextureSize = size;
    this.boneTexture = new Texture(this.gl, {
      image: this.boneMatrices,
      generateMipmaps: false,
      type: this.gl.FLOAT,
      internalFormat: this.gl.renderer.isWebgl2 ? this.gl.RGBA32F : this.gl.RGBA,
      minFilter: this.gl.NEAREST,
      magFilter: this.gl.NEAREST,
      flipY: false,
      width: size
    });
  }
  updateUniforms() {
    this.skeleton.joints.forEach((bone, i) => {
      tempMat4.multiply(bone.worldMatrix, bone.bindInverse);
      this.boneMatrices.set(tempMat4, i * 16);
    });
    if (this.boneTexture)
      this.boneTexture.needsUpdate = true;
  }
  draw({ camera } = {}) {
    if (!this.program.uniforms.boneTexture) {
      Object.assign(this.program.uniforms, {
        boneTexture: { value: this.boneTexture },
        boneTextureSize: { value: this.boneTextureSize }
      });
    }
    this.updateUniforms();
    const _worldMatrix = this.worldMatrix;
    this.worldMatrix = identity;
    super.draw({ camera });
    this.worldMatrix = _worldMatrix;
  }
};
var TYPE_ARRAY = {
  5121: Uint8Array,
  5122: Int16Array,
  5123: Uint16Array,
  5125: Uint32Array,
  5126: Float32Array,
  "image/jpeg": Uint8Array,
  "image/png": Uint8Array
};
var TYPE_SIZE = {
  SCALAR: 1,
  VEC2: 2,
  VEC3: 3,
  VEC4: 4,
  MAT2: 4,
  MAT3: 9,
  MAT4: 16
};
var ATTRIBUTES = {
  POSITION: "position",
  NORMAL: "normal",
  TANGENT: "tangent",
  TEXCOORD_0: "uv",
  TEXCOORD_1: "uv2",
  COLOR_0: "color",
  WEIGHTS_0: "skinWeight",
  JOINTS_0: "skinIndex"
};
var TRANSFORMS = {
  translation: "position",
  rotation: "quaternion",
  scale: "scale"
};
var GLTFLoader = class {
  static async load(gl, src) {
    const dir = src.split("/").slice(0, -1).join("/") + "/";
    const desc = await this.parseDesc(src);
    return await this.parse(gl, desc, dir);
  }
  static async parse(gl, desc, dir) {
    if (desc.asset === void 0 || desc.asset.version[0] < 2)
      console.warn("Only GLTF >=2.0 supported. Attempting to parse.");
    const buffers = await this.loadBuffers(desc, dir);
    gl.renderer.bindVertexArray(null);
    const bufferViews = this.parseBufferViews(gl, desc, buffers);
    const images = this.parseImages(gl, desc, dir, bufferViews);
    const textures = this.parseTextures(gl, desc, images);
    const materials = this.parseMaterials(gl, desc, textures);
    const skins = this.parseSkins(gl, desc, bufferViews);
    const meshes = this.parseMeshes(gl, desc, bufferViews, materials, skins);
    const nodes = this.parseNodes(gl, desc, meshes, skins);
    this.populateSkins(skins, nodes);
    const animations = this.parseAnimations(gl, desc, nodes, bufferViews);
    const scenes = this.parseScenes(desc, nodes);
    const scene = scenes[desc.scene];
    for (let i = nodes.length; i >= 0; i--)
      if (!nodes[i])
        nodes.splice(i, 1);
    return {
      json: desc,
      buffers,
      bufferViews,
      images,
      textures,
      materials,
      meshes,
      nodes,
      animations,
      scenes,
      scene
    };
  }
  static async parseDesc(src) {
    if (!src.match(/\.glb/)) {
      return await fetch(src).then((res) => res.json());
    } else {
      return await fetch(src).then((res) => res.arrayBuffer()).then((glb) => this.unpackGLB(glb));
    }
  }
  static unpackGLB(glb) {
    const header = new Uint32Array(glb, 0, 3);
    if (header[0] !== 1179937895) {
      throw new Error("Invalid glTF asset.");
    } else if (header[1] !== 2) {
      throw new Error(`Unsupported glTF binary version, "${header[1]}".`);
    }
    const jsonChunkHeader = new Uint32Array(glb, 12, 2);
    const jsonByteOffset = 20;
    const jsonByteLength = jsonChunkHeader[0];
    if (jsonChunkHeader[1] !== 1313821514) {
      throw new Error("Unexpected GLB layout.");
    }
    const jsonText = new TextDecoder().decode(glb.slice(jsonByteOffset, jsonByteOffset + jsonByteLength));
    const json = JSON.parse(jsonText);
    if (jsonByteOffset + jsonByteLength === glb.byteLength)
      return json;
    const binaryChunkHeader = new Uint32Array(glb, jsonByteOffset + jsonByteLength, 2);
    if (binaryChunkHeader[1] !== 5130562) {
      throw new Error("Unexpected GLB layout.");
    }
    const binaryByteOffset = jsonByteOffset + jsonByteLength + 8;
    const binaryByteLength = binaryChunkHeader[0];
    const binary = glb.slice(binaryByteOffset, binaryByteOffset + binaryByteLength);
    json.buffers[0].binary = binary;
    return json;
  }
  static resolveURI(uri, dir) {
    if (typeof uri !== "string" || uri === "")
      return "";
    if (/^https?:\/\//i.test(dir) && /^\//.test(uri)) {
      dir = dir.replace(/(^https?:\/\/[^\/]+).*/i, "$1");
    }
    if (/^(https?:)?\/\//i.test(uri))
      return uri;
    if (/^data:.*,.*$/i.test(uri))
      return uri;
    if (/^blob:.*$/i.test(uri))
      return uri;
    return dir + uri;
  }
  static async loadBuffers(desc, dir) {
    if (!desc.buffers)
      return null;
    return await Promise.all(desc.buffers.map((buffer) => {
      if (buffer.binary)
        return buffer.binary;
      const uri = this.resolveURI(buffer.uri, dir);
      return fetch(uri).then((res) => res.arrayBuffer());
    }));
  }
  static parseBufferViews(gl, desc, buffers) {
    if (!desc.bufferViews)
      return null;
    const bufferViews = desc.bufferViews.map((o) => Object.assign({}, o));
    desc.meshes && desc.meshes.forEach(({ primitives }) => {
      primitives.forEach(({ attributes, indices }) => {
        for (let attr in attributes)
          bufferViews[desc.accessors[attributes[attr]].bufferView].isAttribute = true;
        if (indices === void 0)
          return;
        bufferViews[desc.accessors[indices].bufferView].isAttribute = true;
        bufferViews[desc.accessors[indices].bufferView].target = gl.ELEMENT_ARRAY_BUFFER;
      });
    });
    desc.accessors.forEach(({ bufferView: i, componentType }) => {
      bufferViews[i].componentType = componentType;
    });
    desc.images && desc.images.forEach(({ uri, bufferView: i, mimeType }) => {
      if (i === void 0)
        return;
      bufferViews[i].mimeType = mimeType;
    });
    bufferViews.forEach(({
      buffer: bufferIndex,
      byteOffset = 0,
      byteLength,
      byteStride,
      target = gl.ARRAY_BUFFER,
      name,
      extensions,
      extras,
      componentType,
      mimeType,
      isAttribute
    }, i) => {
      const TypeArray = TYPE_ARRAY[componentType || mimeType];
      const elementBytes = TypeArray.BYTES_PER_ELEMENT;
      const data = new TypeArray(buffers[bufferIndex], byteOffset, byteLength / elementBytes);
      bufferViews[i].data = data;
      bufferViews[i].originalBuffer = buffers[bufferIndex];
      if (!isAttribute)
        return;
      const buffer = gl.createBuffer();
      gl.bindBuffer(target, buffer);
      gl.renderer.state.boundBuffer = buffer;
      gl.bufferData(target, data, gl.STATIC_DRAW);
      bufferViews[i].buffer = buffer;
    });
    return bufferViews;
  }
  static parseImages(gl, desc, dir, bufferViews) {
    if (!desc.images)
      return null;
    return desc.images.map(({ uri, bufferView: bufferViewIndex, mimeType, name }) => {
      const image = new Image();
      image.name = name;
      if (uri) {
        image.src = this.resolveURI(uri, dir);
      } else if (bufferViewIndex !== void 0) {
        const { data } = bufferViews[bufferViewIndex];
        const blob = new Blob([data], { type: mimeType });
        image.src = URL.createObjectURL(blob);
      }
      image.ready = new Promise((res) => {
        image.onload = () => res();
      });
      return image;
    });
  }
  static parseTextures(gl, desc, images) {
    if (!desc.textures)
      return null;
    return desc.textures.map(({ sampler: samplerIndex, source: sourceIndex, name, extensions, extras }) => {
      const options2 = {
        flipY: false,
        wrapS: gl.REPEAT,
        wrapT: gl.REPEAT
      };
      const sampler = samplerIndex !== void 0 ? desc.samplers[samplerIndex] : null;
      if (sampler) {
        ["magFilter", "minFilter", "wrapS", "wrapT"].forEach((prop) => {
          if (sampler[prop])
            options2[prop] = sampler[prop];
        });
      }
      const texture = new Texture(gl, options2);
      texture.name = name;
      const image = images[sourceIndex];
      image.ready.then(() => texture.image = image);
      return texture;
    });
  }
  static parseMaterials(gl, desc, textures) {
    if (!desc.materials)
      return null;
    return desc.materials.map(({
      name,
      extensions,
      extras,
      pbrMetallicRoughness = {},
      normalTexture,
      occlusionTexture,
      emissiveTexture,
      emissiveFactor = [0, 0, 0],
      alphaMode = "OPAQUE",
      alphaCutoff = 0.5,
      doubleSided = false
    }) => {
      const {
        baseColorFactor = [1, 1, 1, 1],
        baseColorTexture,
        metallicFactor = 1,
        roughnessFactor = 1,
        metallicRoughnessTexture
      } = pbrMetallicRoughness;
      if (baseColorTexture) {
        baseColorTexture.texture = textures[baseColorTexture.index];
      }
      if (normalTexture) {
        normalTexture.texture = textures[normalTexture.index];
      }
      if (metallicRoughnessTexture) {
        metallicRoughnessTexture.texture = textures[metallicRoughnessTexture.index];
      }
      if (occlusionTexture) {
        occlusionTexture.texture = textures[occlusionTexture.index];
      }
      if (emissiveTexture) {
        emissiveTexture.texture = textures[emissiveTexture.index];
      }
      return {
        name,
        baseColorFactor,
        baseColorTexture,
        metallicFactor,
        roughnessFactor,
        metallicRoughnessTexture,
        normalTexture,
        occlusionTexture,
        emissiveTexture,
        emissiveFactor,
        alphaMode,
        alphaCutoff,
        doubleSided
      };
    });
  }
  static parseSkins(gl, desc, bufferViews) {
    if (!desc.skins)
      return null;
    return desc.skins.map(({
      inverseBindMatrices,
      skeleton,
      joints
    }) => {
      return {
        inverseBindMatrices: this.parseAccessor(inverseBindMatrices, desc, bufferViews),
        skeleton,
        joints
      };
    });
  }
  static parseMeshes(gl, desc, bufferViews, materials, skins) {
    if (!desc.meshes)
      return null;
    return desc.meshes.map(({
      primitives,
      weights,
      name,
      extensions,
      extras
    }, meshIndex) => {
      let numInstances = 0;
      let skinIndex = false;
      desc.nodes && desc.nodes.forEach(({ mesh, skin }) => {
        if (mesh === meshIndex) {
          numInstances++;
          if (skin !== void 0)
            skinIndex = skin;
        }
      });
      primitives = this.parsePrimitives(gl, primitives, desc, bufferViews, materials, numInstances).map(({ geometry, program, mode }) => {
        const mesh = typeof skinIndex === "number" ? new GLTFSkin(gl, { skeleton: skins[skinIndex], geometry, program, mode }) : new Mesh(gl, { geometry, program, mode });
        mesh.name = name;
        if (mesh.geometry.isInstanced) {
          mesh.numInstances = numInstances;
          mesh.frustumCulled = false;
        }
        return mesh;
      });
      return {
        primitives,
        weights,
        name
      };
    });
  }
  static parsePrimitives(gl, primitives, desc, bufferViews, materials, numInstances) {
    return primitives.map(({
      attributes,
      indices,
      material: materialIndex,
      mode = 4,
      targets,
      extensions,
      extras
    }) => {
      const geometry = new Geometry(gl);
      for (let attr in attributes) {
        geometry.addAttribute(ATTRIBUTES[attr], this.parseAccessor(attributes[attr], desc, bufferViews));
      }
      if (indices !== void 0) {
        geometry.addAttribute("index", this.parseAccessor(indices, desc, bufferViews));
      }
      if (numInstances > 1) {
        geometry.addAttribute("instanceMatrix", {
          instanced: 1,
          size: 16,
          data: new Float32Array(numInstances * 16)
        });
      }
      const program = new NormalProgram(gl);
      if (materialIndex !== void 0) {
        program.gltfMaterial = materials[materialIndex];
      }
      return {
        geometry,
        program,
        mode
      };
    });
  }
  static parseAccessor(index2, desc, bufferViews) {
    const {
      bufferView: bufferViewIndex,
      byteOffset = 0,
      componentType,
      normalized = false,
      count,
      type,
      min,
      max,
      sparse
    } = desc.accessors[index2];
    const {
      data,
      originalBuffer,
      buffer,
      byteOffset: bufferByteOffset = 0,
      byteStride = 0,
      target
    } = bufferViews[bufferViewIndex];
    const size = TYPE_SIZE[type];
    const TypeArray = TYPE_ARRAY[componentType];
    const elementBytes = data.BYTES_PER_ELEMENT;
    const componentStride = byteStride / elementBytes;
    const isInterleaved = !!byteStride && componentStride !== size;
    const newData = isInterleaved ? data : new TypeArray(originalBuffer, byteOffset + bufferByteOffset, count * size);
    return {
      data: newData,
      size,
      type: componentType,
      normalized,
      buffer,
      stride: byteStride,
      offset: byteOffset,
      count,
      min,
      max
    };
  }
  static parseNodes(gl, desc, meshes, skins) {
    if (!desc.nodes)
      return null;
    const nodes = desc.nodes.map(({
      camera,
      children,
      skin: skinIndex,
      matrix,
      mesh: meshIndex,
      rotation,
      scale: scale2,
      translation,
      weights,
      name,
      extensions,
      extras
    }) => {
      const node = new Transform();
      if (name)
        node.name = name;
      if (matrix) {
        node.matrix.copy(matrix);
        node.decompose();
      } else {
        if (rotation)
          node.quaternion.copy(rotation);
        if (scale2)
          node.scale.copy(scale2);
        if (translation)
          node.position.copy(translation);
        node.updateMatrix();
      }
      let isInstanced = false;
      let isFirstInstance = true;
      if (meshIndex !== void 0) {
        meshes[meshIndex].primitives.forEach((mesh) => {
          if (mesh.geometry.isInstanced) {
            isInstanced = true;
            if (!mesh.instanceCount) {
              mesh.instanceCount = 0;
            } else {
              isFirstInstance = false;
            }
            node.matrix.toArray(mesh.geometry.attributes.instanceMatrix.data, mesh.instanceCount * 16);
            mesh.instanceCount++;
            if (mesh.instanceCount === mesh.numInstances) {
              delete mesh.numInstances;
              delete mesh.instanceCount;
              mesh.geometry.attributes.instanceMatrix.needsUpdate = true;
            }
          }
          if (isInstanced) {
            if (isFirstInstance)
              mesh.setParent(node);
          } else {
            mesh.setParent(node);
          }
        });
      }
      if (isInstanced) {
        if (!isFirstInstance)
          return null;
        node.matrix.identity();
        node.decompose();
      }
      return node;
    });
    desc.nodes.forEach(({ children = [] }, i) => {
      children.forEach((childIndex) => {
        if (!nodes[childIndex])
          return;
        nodes[childIndex].setParent(nodes[i]);
      });
    });
    return nodes;
  }
  static populateSkins(skins, nodes) {
    if (!skins)
      return;
    skins.forEach((skin) => {
      skin.joints = skin.joints.map((i, index2) => {
        const joint = nodes[i];
        joint.bindInverse = new Mat4(...skin.inverseBindMatrices.data.slice(index2 * 16, (index2 + 1) * 16));
        return joint;
      });
      if (skin.skeleton)
        skin.skeleton = nodes[skin.skeleton];
    });
  }
  static parseAnimations(gl, desc, nodes, bufferViews) {
    if (!desc.animations)
      return null;
    return desc.animations.map(({
      channels,
      samplers,
      name
    }) => {
      const data = channels.map(({
        sampler: samplerIndex,
        target
      }) => {
        const {
          input: inputIndex,
          interpolation = "LINEAR",
          output: outputIndex
        } = samplers[samplerIndex];
        const {
          node: nodeIndex,
          path
        } = target;
        const node = nodes[nodeIndex];
        const transform = TRANSFORMS[path];
        const times = this.parseAccessor(inputIndex, desc, bufferViews).data;
        const values = this.parseAccessor(outputIndex, desc, bufferViews).data;
        return {
          node,
          transform,
          interpolation,
          times,
          values
        };
      });
      return {
        name,
        animation: new GLTFAnimation(data)
      };
    });
  }
  static parseScenes(desc, nodes) {
    if (!desc.scenes)
      return null;
    return desc.scenes.map(({
      nodes: nodesIndices = [],
      name,
      extensions,
      extras
    }) => {
      return nodesIndices.reduce((map, i) => {
        if (nodes[i])
          map.push(nodes[i]);
        return map;
      }, []);
    });
  }
};
var Sphere = class extends Geometry {
  constructor(gl, {
    radius = 0.5,
    widthSegments = 16,
    heightSegments = Math.ceil(widthSegments * 0.5),
    phiStart = 0,
    phiLength = Math.PI * 2,
    thetaStart = 0,
    thetaLength = Math.PI,
    attributes = {}
  } = {}) {
    const wSegs = widthSegments;
    const hSegs = heightSegments;
    const pStart = phiStart;
    const pLength = phiLength;
    const tStart = thetaStart;
    const tLength = thetaLength;
    const num = (wSegs + 1) * (hSegs + 1);
    const numIndices = wSegs * hSegs * 6;
    const position = new Float32Array(num * 3);
    const normal = new Float32Array(num * 3);
    const tangent = new Float32Array(num * 3);
    const binormal = new Float32Array(num * 3);
    const uv = new Float32Array(num * 2);
    const index2 = num > 65536 ? new Uint32Array(numIndices) : new Uint16Array(numIndices);
    let i = 0;
    let iv = 0;
    let ii = 0;
    let te = tStart + tLength;
    const grid = [];
    let n = new Vec3();
    let t = new Vec3();
    let b = new Vec3();
    const halfPI = Math.PI * 0.5;
    for (let iy = 0; iy <= hSegs; iy++) {
      let vRow = [];
      let v = iy / hSegs;
      for (let ix = 0; ix <= wSegs; ix++, i++) {
        let u = ix / wSegs;
        let x = -radius * Math.cos(pStart + u * pLength) * Math.sin(tStart + v * tLength);
        let y = radius * Math.cos(tStart + v * tLength);
        let z = radius * Math.sin(pStart + u * pLength) * Math.sin(tStart + v * tLength);
        position[i * 3] = x;
        position[i * 3 + 1] = y;
        position[i * 3 + 2] = z;
        n.set(x, y, z).normalize();
        normal[i * 3] = n.x;
        normal[i * 3 + 1] = n.y;
        normal[i * 3 + 2] = n.z;
        const tangentX = -Math.cos(pStart + u * pLength + halfPI);
        const tangentY = 0;
        const tangentZ = Math.sin(pStart + u * pLength + halfPI);
        t.set(tangentX, tangentY, tangentZ).normalize();
        tangent[i * 3] = t.x;
        tangent[i * 3 + 1] = t.y;
        tangent[i * 3 + 2] = t.z;
        b.copy(n).cross(t).normalize();
        binormal[i * 3] = b.x;
        binormal[i * 3 + 1] = b.y;
        binormal[i * 3 + 2] = b.z;
        uv[i * 2] = u;
        uv[i * 2 + 1] = 1 - v;
        vRow.push(iv++);
      }
      grid.push(vRow);
    }
    for (let iy = 0; iy < hSegs; iy++) {
      for (let ix = 0; ix < wSegs; ix++) {
        let a = grid[iy][ix + 1];
        let b2 = grid[iy][ix];
        let c = grid[iy + 1][ix];
        let d2 = grid[iy + 1][ix + 1];
        if (iy !== 0 || tStart > 0) {
          index2[ii * 3] = a;
          index2[ii * 3 + 1] = b2;
          index2[ii * 3 + 2] = d2;
          ii++;
        }
        if (iy !== hSegs - 1 || te < Math.PI) {
          index2[ii * 3] = b2;
          index2[ii * 3 + 1] = c;
          index2[ii * 3 + 2] = d2;
          ii++;
        }
      }
    }
    Object.assign(attributes, {
      position: { size: 3, data: position },
      normal: { size: 3, data: normal },
      tangent: { size: 3, data: tangent },
      binormal: { size: 3, data: binormal },
      uv: { size: 2, data: uv },
      index: { data: index2 }
    });
    super(gl, attributes);
  }
};
var vertex$6 = "precision highp float;\r\n\r\nattribute vec3 position;\r\nattribute vec3 normal;\r\nattribute vec3 tangent;\r\nattribute vec3 binormal;\r\nattribute vec2 uv;\r\n\r\nuniform mat4 projectionMatrix;\r\nuniform mat4 modelViewMatrix;\r\nuniform mat3 normalMatrix;\r\n\r\nuniform float _Time;\r\n\r\nvarying vec2 vUv;\r\nvarying vec3 vNormal;\r\nvarying vec3 vTangent;\r\nvarying vec4 vMvPos;\r\nvarying vec2 vMatcap;\r\nvarying vec3 vPos;\r\nvarying vec3 vNoise;\r\nvarying float vTarget;\r\n\r\n// #define EPS 0.0005\r\n// #define EPS 0.0005\r\n#define EPS 0.001\r\n\r\n// #define SPATIALF 18.123523\r\n// #define SPATIALF 11.123523\r\n// #define SPATIALF 34.123523\r\n// #define SPATIALF 1.123523\r\n#define SPATIALF 3.723523\r\n// #define SPATIALF 17.345343\r\n#define TEMPORALF 0.7\r\n#define AMP 0.07\r\n#define OCTAVES 4\r\n// #define FALLOFF .731513\r\n#define FALLOFF 0.824\r\n// #define FALLOFF 0.524\r\n// #define FALLOFF 1.0\r\n\r\n// #define SPATIALF 4.123523\r\n// // #define SPATIALF 17.345343\r\n// #define TEMPORALF 0.4\r\n// #define AMP 1.5\r\n// #define OCTAVES 5\r\n// #define FALLOFF 0.531513\r\n\r\n#define m3 mat3(-0.73736, 0.45628, 0.49808, 0, -0.73736, 0.67549, 0.67549, 0.49808, 0.54371)\r\nvec3 sinNoise33(vec3 st) {\r\n    // st.z *= TEMPORALF;\r\n    vec3 noise = vec3(0.0,0.0,0.0);\r\n    float a = 1.0;\r\n    float f = 1.0;\r\n    for(int i = 0; i < OCTAVES; i++) {\r\n        \r\n        st = m3 * st;\r\n        // noise += sin(st.xyz*f)*a;\r\n        noise += sin(st.zxy*f)*a;\r\n        // noise += sin(st.yzx*f)*a;\r\n        // st += (_Time * TEMPORALF*0.125);\r\n        st += noise;\r\n\r\n        //  a *= FALLOFF;\r\n        //  f /= FALLOFF;\r\n    }\r\n    return noise;\r\n}\r\n\r\n//\r\n// Description : Array and textureless GLSL 2D/3D/4D simplex \r\n//               noise functions.\r\n//      Author : Ian McEwan, Ashima Arts.\r\n//  Maintainer : stegu\r\n//     Lastmod : 20201014 (stegu)\r\n//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.\r\n//               Distributed under the MIT License. See LICENSE file.\r\n//               https://github.com/ashima/webgl-noise\r\n//               https://github.com/stegu/webgl-noise\r\n// \r\n\r\nvec3 mod289(vec3 x) {\r\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\r\n}\r\n\r\nvec4 mod289(vec4 x) {\r\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\r\n}\r\n\r\nvec4 permute(vec4 x) {\r\n     return mod289(((x*34.0)+1.0)*x);\r\n}\r\n\r\nvec4 taylorInvSqrt(vec4 r)\r\n{\r\n  return 1.79284291400159 - 0.85373472095314 * r;\r\n}\r\n\r\nfloat snoise(vec3 v)\r\n  { \r\n  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;\r\n  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);\r\n\r\n// First corner\r\n  vec3 i  = floor(v + dot(v, C.yyy) );\r\n  vec3 x0 =   v - i + dot(i, C.xxx) ;\r\n\r\n// Other corners\r\n  vec3 g = step(x0.yzx, x0.xyz);\r\n  vec3 l = 1.0 - g;\r\n  vec3 i1 = min( g.xyz, l.zxy );\r\n  vec3 i2 = max( g.xyz, l.zxy );\r\n\r\n  //   x0 = x0 - 0.0 + 0.0 * C.xxx;\r\n  //   x1 = x0 - i1  + 1.0 * C.xxx;\r\n  //   x2 = x0 - i2  + 2.0 * C.xxx;\r\n  //   x3 = x0 - 1.0 + 3.0 * C.xxx;\r\n  vec3 x1 = x0 - i1 + C.xxx;\r\n  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y\r\n  vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y\r\n\r\n// Permutations\r\n  i = mod289(i); \r\n  vec4 p = permute( permute( permute( \r\n             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))\r\n           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) \r\n           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));\r\n\r\n// Gradients: 7x7 points over a square, mapped onto an octahedron.\r\n// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)\r\n  float n_ = 0.142857142857; // 1.0/7.0\r\n  vec3  ns = n_ * D.wyz - D.xzx;\r\n\r\n  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)\r\n\r\n  vec4 x_ = floor(j * ns.z);\r\n  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)\r\n\r\n  vec4 x = x_ *ns.x + ns.yyyy;\r\n  vec4 y = y_ *ns.x + ns.yyyy;\r\n  vec4 h = 1.0 - abs(x) - abs(y);\r\n\r\n  vec4 b0 = vec4( x.xy, y.xy );\r\n  vec4 b1 = vec4( x.zw, y.zw );\r\n\r\n  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;\r\n  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;\r\n  vec4 s0 = floor(b0)*2.0 + 1.0;\r\n  vec4 s1 = floor(b1)*2.0 + 1.0;\r\n  vec4 sh = -step(h, vec4(0.0));\r\n\r\n  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;\r\n  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;\r\n\r\n  vec3 p0 = vec3(a0.xy,h.x);\r\n  vec3 p1 = vec3(a0.zw,h.y);\r\n  vec3 p2 = vec3(a1.xy,h.z);\r\n  vec3 p3 = vec3(a1.zw,h.w);\r\n\r\n//Normalise gradients\r\n  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));\r\n  p0 *= norm.x;\r\n  p1 *= norm.y;\r\n  p2 *= norm.z;\r\n  p3 *= norm.w;\r\n\r\n// Mix final noise value\r\n  vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);\r\n  m = m * m;\r\n  return 105.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), \r\n                                dot(p2,x2), dot(p3,x3) ) );\r\n  }\r\n\r\n  //test this\r\n  //http://lolengine.net/blog/2013/09/21/picking-orthogonal-vector-combing-coconuts\r\n\r\n  mat2 rotate2D(float a) {\r\n\r\n    return mat2(cos(a), -sin(a), sin(a), cos(a));\r\n\r\n  }\r\n\r\nvoid main() {\r\n\r\n    vec3 pos = position;\r\n    vec3 tan = tangent;\r\n    vec3 norm = normal;\r\n    // vec3 biNormal = normalize(cross(tan, norm));\r\n    vec3 biNormal = binormal;\r\n\r\n    // vec3 target = vec3(0.0, 0.0, 1.0) - pos;\r\n    // float dist = length(target);\r\n    // float phase = 1.0-abs(fract(_Time*.1)*2.0 - dist);\r\n    // phase = cos(phase*4.0);\r\n    // phase = pow(phase, 8.0);\r\n\r\n    vTarget = 0.0;\r\n\r\n    // pos += normal * phase * .1;\r\n    \r\n    vec3 up = pos + (biNormal * EPS);\r\n    vec3 down = pos + (biNormal * -EPS);\r\n    vec3 forward = pos + (tan * EPS);\r\n    vec3 back = pos + (tan * -EPS);\r\n\r\n    // float revealDirection = dot(normalize(vec3(cos(_Time) * sin(_Time * 0.5), sin(_Time * 0.5), sin(_Time) * sin(_Time*0.5))), normal) * 0.5+0.5;\r\n    // revealDirection = revealDirection*revealDirection*revealDirection;\r\n    float amp = mix(0.0, AMP, 1.0);\r\n\r\n    vec3 noise = (sinNoise33((pos*SPATIALF) + (_Time * TEMPORALF))*0.5+0.5) * amp;\r\n    vec3 noiseUp = (sinNoise33(up*SPATIALF+ (_Time * TEMPORALF))*0.5+0.5) * amp;\r\n    vec3 noiseDown = (sinNoise33(down*SPATIALF+ (_Time * TEMPORALF))*0.5+0.5) * amp;\r\n    vec3 noiseforward = (sinNoise33(forward*SPATIALF+(_Time * TEMPORALF))*0.5+0.5) * amp;\r\n    vec3 noiseback = (sinNoise33(back*SPATIALF+(_Time * TEMPORALF))*0.5+0.5) * amp;\r\n\r\n    // pos += noise;\r\n    // up += noiseUp;\r\n    // down += noiseDown;\r\n    // forward += noiseforward;\r\n    // back += noiseback;\r\n\r\n    pos += noise;\r\n    up += noiseUp;\r\n    down += noiseDown;\r\n    forward += noiseforward;\r\n    back += noiseback;\r\n\r\n    // float noise = (snoise((pos*SPATIALF) + (_Time * TEMPORALF))*0.5+0.5) * AMP;\r\n    // float noiseUp = (snoise(up*SPATIALF+ (_Time * TEMPORALF))*0.5+0.5) * AMP;\r\n    // float noiseDown = (snoise(down*SPATIALF+ (_Time * TEMPORALF))*0.5+0.5) * AMP;\r\n    // float noiseforward = (snoise(forward*SPATIALF+(_Time * TEMPORALF))*0.5+0.5) * AMP;\r\n    // float noiseback = (snoise(back*SPATIALF+(_Time * TEMPORALF))*0.5+0.5) * AMP;\r\n\r\n    // pos += (pos) * noise;\r\n    // up += (up) * noiseUp;\r\n    // down += (down) * noiseDown;\r\n    // forward += (forward) * noiseforward;\r\n    // back += (back) * noiseback;\r\n\r\n    // vec3 tangentGrad = normalize((pos-back) + (forward-pos));\r\n    // vec3 biNormalGrad = normalize((pos-down) + (up-pos));\r\n\r\n    vec3 tangentGrad = normalize((forward) - (back));\r\n    vec3 biNormalGrad = normalize((up) - (down));\r\n\r\n    //vec3 noisyNormal = (cross(tangentGrad, biNormalGrad));\r\n    vec3 noisyNormal = normalize(cross(tangentGrad, biNormalGrad));\r\n    // vec3 noisyNormal = (cross(tangentGrad, biNormalGrad));\r\n    \r\n    vNormal = normalMatrix * normalize(noisyNormal);\r\n    vTangent = tangent;\r\n    vUv = uv;\r\n    vMvPos = modelViewMatrix * vec4(pos, 1.0);\r\n    vPos = pos;\r\n    vNoise = vec3(noise);\r\n\r\n    gl_Position = projectionMatrix * vMvPos;\r\n\r\n}";
var fragment$3 = "precision highp float;\r\n\r\nuniform sampler2D _MatCap;\r\n\r\nuniform vec3 cameraPosition;\r\nuniform float _Time;\r\n\r\nvarying vec3 vNormal;\r\nvarying vec3 vTangent;\r\nvarying vec2 vUv;\r\nvarying vec4 vMvPos;\r\nvarying vec3 vPos;\r\nvarying float vTarget;\r\n\r\n#define LIGHT vec3(0.0, 5.0, 5.0)\r\n\r\nvec2 matcap(vec3 eye, vec3 normal) {\r\n    vec3 reflected = reflect(eye, normal);\r\n    float m = 2.8284271247461903 * sqrt(reflected.z + 1.0);\r\n    return reflected.xy / m + 0.5;\r\n}\r\n\r\nvec3 hash32(vec2 p)\r\n{\r\n	vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));\r\n    p3 += dot(p3, p3.yxz+33.33);\r\n    return fract((p3.xxy+p3.yzz)*p3.zyx);\r\n}\r\n\r\nvoid main() {\r\n\r\n    vec3 norm = normalize(vNormal);\r\n    vec3 viewDir = normalize(vMvPos.xyz);\r\n\r\n    vec3 hash1 = hash32(gl_FragCoord.xy+fract(_Time)*1387.0);\r\n    vec3 hash2 = hash32(gl_FragCoord.yx+fract(_Time)*1721.0);\r\n    vec3 dither = ((hash1) + (hash2-1.0)) / 255.0;\r\n\r\n    vec2 matcapCoord = matcap(viewDir, norm);\r\n\r\n    float matcapLight = texture2D(_MatCap, matcapCoord).y;\r\n    // matcapLight = matcapLight*matcapLight*matcapLight*matcapLight*matcapLight;\r\n    matcapLight = matcapLight*matcapLight;\r\n    // matcapLight *= 1.2;\r\n\r\n    float halfLambert = dot(norm, normalize(LIGHT))*0.5+0.5;\r\n    // halfLambert = halfLambert*halfLambert;\r\n\r\n    float fresnel = 1.0-(dot(-viewDir, norm)*0.5+0.5);\r\n    fresnel = fresnel * fresnel*fresnel*fresnel;\r\n    fresnel *= 1.0;\r\n\r\n    float fog = smoothstep(8.0, 4.0, vMvPos.z*vMvPos.z);\r\n    // vec3 col = mix(vec3(0.12342, 0.134, 0.9312), vec3(0.95, 0.134, 0.1312), halfLambert);\r\n    vec3 col = mix(norm * 0.5 + 0.5, vec3(halfLambert), 1.0-fresnel);\r\n    // col *= halfLambert + matcapLight;\r\n    // col += matcapLight*.3;\r\n\r\n    gl_FragColor = vec4(col, 1.0);\r\n    // gl_FragColor = vec4(vec3(matcapLight*(halfLambert+fresnel)), 1.0);\r\n    // gl_FragColor = vec4(vec3(vTarget), 1.0);\r\n    // gl_FragColor = vec4(vec3(halfLambert), 1.0);\r\n    //gl_FragColor = vec4(vec3(mix(vec3(0.0), col, halfLambert*halfLambert)), 1.0);\r\n\r\n}";
var SphereMesh$1 = class extends Mesh {
  constructor(gl) {
    super(gl);
    console.log(fragment$3);
    this.gl = gl;
    this.initGeometry();
    this.initProgram();
  }
  initGeometry() {
    this.geometry = new Sphere(this.gl, {
      widthSegments: 256,
      radius: 1
    });
  }
  initProgram() {
    const matcap = new Image();
    matcap.crossOrigin = "*";
    matcap.src = "./src/lib/sketches/StrangeSphere/assets/steel.jpg";
    const texture = new Texture(this.gl, {
      generateMipMaps: true
    });
    matcap.onload = () => texture.image = matcap;
    const uniforms = {
      _MatCap: {
        value: texture
      },
      _Time: {
        value: 0
      }
    };
    this.program = new Program(this.gl, {
      uniforms,
      vertex: vertex$6,
      fragment: fragment$3,
      cullFace: null
    });
  }
  update({ time, deltaTime }) {
    this.program.uniforms._Time.value += deltaTime;
  }
};
var StrangeSphere = class {
  constructor({ el }) {
    this.init({ el });
    this.initMesh();
  }
  init({ el }) {
    this.renderer = new Renderer({
      canvas: el,
      width: el.clientWidth,
      height: el.clientHeight,
      antialias: true,
      dpr: 1
    });
    this.gl = this.renderer.gl;
    const bg = 0.93;
    this.gl.clearColor(bg, bg, bg, 1);
    const {
      clientWidth,
      clientHeight
    } = this.gl.canvas;
    this.wk = 1 / clientWidth;
    this.hK = 1 / clientHeight;
    this.camera = new Camera(this.gl, {
      aspect: clientWidth / clientHeight
    });
    this.camera.position.x = 0;
    this.camera.position.y = 0;
    this.camera.position.z = 5;
    this.controls = new Orbit(this.camera, {
      target: new Vec3(0, 0, 0)
    });
    this.scene = new Transform();
  }
  initMesh() {
    this.sphereMesh = new SphereMesh$1(this.gl);
    this.sphereMesh.setParent(this.scene);
  }
  render({
    scene,
    camera = null,
    target = null,
    clear
  }) {
    this.renderer.render({
      scene,
      camera,
      clear
    });
  }
  update({
    time,
    deltaTime
  }) {
    this.controls.update();
    this.sphereMesh.update({ time, deltaTime });
    this.render({
      scene: this.scene,
      camera: this.camera,
      clear: true
    });
  }
  onResize(width, height) {
    if (width && height) {
      this.renderer.setSize(width, height);
      const {
        clientWidth,
        clientHeight
      } = this.gl.canvas;
      this.wk = 1 / clientWidth;
      this.hK = 1 / clientHeight;
      this.camera.perspective({
        aspect: clientWidth / clientHeight
      });
    }
  }
};
var css$4 = {
  code: ".sketch.svelte-q6ubty{position:absolute;min-width:100vw;min-height:100vh;overflow:hidden}.webgl-canvas.svelte-q6ubty{position:fixed;width:100%;height:100%;top:0;left:0;margin:0;border:0px}",
  map: '{"version":3,"file":"strangeSphere.svelte","sources":["strangeSphere.svelte"],"sourcesContent":["<!-- <script context=\\"module\\">\\r\\n\\t/**\\r\\n\\t * @type {import(\'@sveltejs/kit\').Load}\\r\\n\\t */\\r\\n\\texport async function load({ page, fetch, session, context }) {\\r\\n\\t\\tconst url = `/blog/${page.params.slug}.json`;\\r\\n\\t\\tconst res = await fetch(url);\\r\\n\\r\\n\\t\\tif (res.ok) {\\r\\n\\t\\t\\treturn {\\r\\n\\t\\t\\t\\tprops: {\\r\\n\\t\\t\\t\\t\\tarticle: await res.json()\\r\\n\\t\\t\\t\\t}\\r\\n\\t\\t\\t};\\r\\n\\t\\t}\\r\\n\\r\\n\\t\\treturn {\\r\\n\\t\\t\\tstatus: res.status,\\r\\n\\t\\t\\terror: new Error(`Could not load ${url}`)\\r\\n\\t\\t};\\r\\n\\t}\\r\\n<\/script> -->\\r\\n\\r\\n<script>\\r\\n    \\r\\n    import { onMount, tick } from \\"svelte\\";\\r\\n    import {StrangeSphere} from \'$lib/sketches/strangeSphere/strangeSphere.js\';\\r\\n    //--------------------------------\\r\\n    \\r\\n    // export let article;\\r\\n    \\r\\n    //--------------------------------\\r\\n    \\r\\n    let el;\\r\\n    let canvas;\\r\\n    let sketch;\\r\\n\\r\\n    let containerWidth = 2;\\r\\n    let containerHeight = 2;\\r\\n\\r\\n    let time = 0;\\r\\n    let deltaTime = 0;\\r\\n    let prevTime = 0;\\r\\n    \\r\\n    //--------------------------------\\r\\n    \\r\\n    onMount(async()=> {\\r\\n        \\r\\n        await tick();\\r\\n\\r\\n        sketch = new StrangeSphere({el: canvas});\\r\\n\\r\\n        handleTick();\\r\\n            \\r\\n    });\\r\\n\\r\\n    const updateClock = () => {\\r\\n\\r\\n        time = performance.now();\\r\\n        deltaTime = (time - prevTime) * 0.001;\\r\\n        prevTime = time;\\r\\n\\r\\n    }\\r\\n\\r\\n    const handleTick = () => {\\r\\n        window.requestAnimationFrame(() => handleTick());\\r\\n        updateClock();\\r\\n        sketch.update({time, deltaTime});\\r\\n\\r\\n    }\\r\\n\\r\\n    const handleResize = () => {\\r\\n        sketch.onresize({width: containerWidth, height: containerHeight})\\r\\n    }\\r\\n    \\r\\n<\/script>\\r\\n\\r\\n<svelte:window on:resize={handleResize} />\\r\\n    \\r\\n<main class=\\"sketch\\" bind:this={el} bind:clientWidth={containerWidth} bind:clientHeight={containerHeight}>\\r\\n    <canvas class=\\"webgl-canvas\\" bind:this={canvas}></canvas>\\r\\n</main>\\r\\n    \\r\\n<style lang=\\"scss\\">.sketch {\\n  position: absolute;\\n  min-width: 100vw;\\n  min-height: 100vh;\\n  overflow: hidden;\\n}\\n\\n.webgl-canvas {\\n  position: fixed;\\n  width: 100%;\\n  height: 100%;\\n  top: 0;\\n  left: 0;\\n  margin: 0;\\n  border: 0px;\\n}</style>"],"names":[],"mappings":"AAmFmB,OAAO,cAAC,CAAC,AAC1B,QAAQ,CAAE,QAAQ,CAClB,SAAS,CAAE,KAAK,CAChB,UAAU,CAAE,KAAK,CACjB,QAAQ,CAAE,MAAM,AAClB,CAAC,AAED,aAAa,cAAC,CAAC,AACb,QAAQ,CAAE,KAAK,CACf,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,GAAG,CAAE,CAAC,CACN,IAAI,CAAE,CAAC,CACP,MAAM,CAAE,CAAC,CACT,MAAM,CAAE,GAAG,AACb,CAAC"}'
};
var StrangeSphere_1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let el;
  let canvas;
  let sketch;
  let time = 0;
  let deltaTime = 0;
  let prevTime = 0;
  onMount(async () => {
    await tick();
    sketch = new StrangeSphere({ el: canvas });
    handleTick();
  });
  const updateClock = () => {
    time = performance.now();
    deltaTime = (time - prevTime) * 1e-3;
    prevTime = time;
  };
  const handleTick = () => {
    window.requestAnimationFrame(() => handleTick());
    updateClock();
    sketch.update({ time, deltaTime });
  };
  $$result.css.add(css$4);
  return `




    
<main class="${"sketch svelte-q6ubty"}"${add_attribute("this", el, 1)}><canvas class="${"webgl-canvas svelte-q6ubty"}"${add_attribute("this", canvas, 1)}></canvas>
</main>`;
});
var strangeSphere = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": StrangeSphere_1
});
var ACCESSTOKENKEY = "ACCESS_TOKEN";
var css$3 = {
  code: ".login-button.svelte-tm0bkf{font-family:Arial;cursor:pointer;position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:200px;height:50px;border-radius:999999px;border:0px;background-color:aqua;text-align:center;color:white;font-size:18px}",
  map: `{"version":3,"file":"SpotifyAuthentication.svelte","sources":["SpotifyAuthentication.svelte"],"sourcesContent":["<script>\\r\\n\\r\\n    import {onMount, createEventDispatcher} from \\"svelte\\";\\r\\n\\r\\n    //-----------------------------------\\r\\n\\r\\n    //-----------------------------------\\r\\n\\r\\n    const dispatch = createEventDispatcher();\\r\\n    const stateKey = 'spotify_auth_state';\\r\\n\\r\\n    onMount(() => {\\r\\n        getAccessToken();\\r\\n    })\\r\\n\\r\\n    //TODO: REMOVE ACCESS TOKEN AFTER X TIME TO PREVENT ERRORS DUE TO OLD ACCESS TOKENS\\r\\n    const getAccessToken = () => {\\r\\n\\r\\n        let params = getHashParams();\\r\\n\\r\\n        let access_token = params.access_token,\\r\\n            state = params.state,\\r\\n            storedState = localStorage.getItem(stateKey);\\r\\n\\r\\n        if (access_token && (state === null || state !== storedState)) {\\r\\n            alert('There was an error during the authentication');\\r\\n            // return;\\r\\n        } else {\\r\\n            localStorage.removeItem(stateKey);\\r\\n            if (access_token) {\\r\\n                dispatch('accessTokenRecieved', {\\r\\n                    token: access_token\\r\\n                })\\r\\n            }\\r\\n        }\\r\\n    }\\r\\n\\r\\n    /**\\r\\n     * Obtains parameters from the hash of the URL\\r\\n     * @return Object\\r\\n     */\\r\\n    function getHashParams() {\\r\\n        var hashParams = {};\\r\\n        var e, r = /([^&;=]+)=?([^&;]*)/g,\\r\\n            q = window.location.hash.substring(1);\\r\\n        while (e = r.exec(q)) {\\r\\n            hashParams[e[1]] = decodeURIComponent(e[2]);\\r\\n        }\\r\\n        return hashParams;\\r\\n    }\\r\\n\\r\\n    /**\\r\\n     * Generates a random string containing numbers and letters\\r\\n     * @param  {number} length The length of the string\\r\\n     * @return {string} The generated string\\r\\n     */\\r\\n    function generateRandomString(length) {\\r\\n        var text = '';\\r\\n        var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';\\r\\n\\r\\n        for (var i = 0; i < length; i++) {\\r\\n            text += possible.charAt(Math.floor(Math.random() * possible.length));\\r\\n        }\\r\\n        return text;\\r\\n    };\\r\\n\\r\\n    const handleClick = (e) => {\\r\\n\\r\\n        e.preventDefault();\\r\\n\\r\\n        var client_id = 'd6aba07484274df39a3fda627e8bc331'; // Your client id\\r\\n        var redirect_uri = 'http://localhost:8080/soundScape'; // Your redirect uri\\r\\n\\r\\n        var state = generateRandomString(16);\\r\\n\\r\\n        localStorage.setItem(stateKey, state);\\r\\n        var scope = \\"streaming user-read-email user-read-private\\";\\r\\n\\r\\n        var url = 'https://accounts.spotify.com/authorize';\\r\\n        url += '?response_type=token';\\r\\n        url += '&client_id=' + encodeURIComponent(client_id);\\r\\n        url += '&scope=' + encodeURIComponent(scope);\\r\\n        url += '&redirect_uri=' + encodeURIComponent(redirect_uri);\\r\\n        url += '&state=' + encodeURIComponent(state);\\r\\n\\r\\n        window.location = url;\\r\\n\\r\\n    }\\r\\n\\r\\n<\/script>\\r\\n<button class=\\"login-button\\" on:click={handleClick}>Log in</button>\\r\\n<svelte:head>\\r\\n</svelte:head>\\r\\n<style lang=\\"scss\\">.login-button {\\n  font-family: Arial;\\n  cursor: pointer;\\n  position: absolute;\\n  top: 50%;\\n  left: 50%;\\n  transform: translate(-50%, -50%);\\n  width: 200px;\\n  height: 50px;\\n  border-radius: 999999px;\\n  border: 0px;\\n  background-color: aqua;\\n  text-align: center;\\n  color: white;\\n  font-size: 18px;\\n}</style>\\r\\n"],"names":[],"mappings":"AA6FmB,aAAa,cAAC,CAAC,AAChC,WAAW,CAAE,KAAK,CAClB,MAAM,CAAE,OAAO,CACf,QAAQ,CAAE,QAAQ,CAClB,GAAG,CAAE,GAAG,CACR,IAAI,CAAE,GAAG,CACT,SAAS,CAAE,UAAU,IAAI,CAAC,CAAC,IAAI,CAAC,CAChC,KAAK,CAAE,KAAK,CACZ,MAAM,CAAE,IAAI,CACZ,aAAa,CAAE,QAAQ,CACvB,MAAM,CAAE,GAAG,CACX,gBAAgB,CAAE,IAAI,CACtB,UAAU,CAAE,MAAM,CAClB,KAAK,CAAE,KAAK,CACZ,SAAS,CAAE,IAAI,AACjB,CAAC"}`
};
var stateKey = "spotify_auth_state";
function getHashParams() {
  var hashParams = {};
  var e, r = /([^&;=]+)=?([^&;]*)/g, q = window.location.hash.substring(1);
  while (e = r.exec(q)) {
    hashParams[e[1]] = decodeURIComponent(e[2]);
  }
  return hashParams;
}
var SpotifyAuthentication = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  const dispatch = createEventDispatcher();
  onMount(() => {
    getAccessToken();
  });
  const getAccessToken = () => {
    let params = getHashParams();
    let access_token = params.access_token, state = params.state, storedState = localStorage.getItem(stateKey);
    if (access_token && (state === null || state !== storedState)) {
      alert("There was an error during the authentication");
    } else {
      localStorage.removeItem(stateKey);
      if (access_token) {
        dispatch("accessTokenRecieved", { token: access_token });
      }
    }
  };
  $$result.css.add(css$3);
  return `<button class="${"login-button svelte-tm0bkf"}">Log in</button>
${$$result.head += ``, ""}`;
});
var SpotifyPlayer = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let spotifySDK;
  let player;
  let spotifyApi;
  let accessToken;
  let trackAnalysisAcquired = false;
  let prevTrackID = null;
  const dispatch = createEventDispatcher();
  onMount(() => {
    accessToken = localStorage.getItem(ACCESSTOKENKEY);
    if (accessToken === void 0) {
      console.error("no valid access token provided");
      return;
    }
    initAPI();
    initSpotifyPlayer();
  });
  const initAPI = () => {
    spotifyApi = new import_spotify_web_api_js.default();
    spotifyApi.setAccessToken(accessToken);
  };
  const initSpotifyPlayer = () => {
    spotifySDK = document.createElement("script");
    spotifySDK.src = "https://sdk.scdn.co/spotify-player.js";
    spotifySDK.async = false;
    spotifySDK.defer = true;
    document.head.append(spotifySDK);
    window.onSpotifyWebPlaybackSDKReady = () => {
      player = new Spotify.Player({
        name: "Sound Scape Player",
        getOAuthToken: (cb) => {
          cb(accessToken);
        }
      });
      player.addListener("initialization_error", ({ message }) => {
        console.error(message);
      });
      player.addListener("authentication_error", ({ message }) => {
        console.error(message);
      });
      player.addListener("account_error", ({ message }) => {
        console.error(message);
      });
      player.addListener("playback_error", ({ message }) => {
        console.error(message);
      });
      player.addListener("player_state_changed", ({ track_window }) => {
        if (track_window === null)
          return;
        if (track_window) {
          trackAnalysisAcquired = false;
          const { current_track } = track_window;
          if (current_track.id) {
            if (current_track.id === prevTrackID)
              return;
            getAudioAnalysis({ id: current_track.id });
            prevTrackID = current_track.id;
          }
        }
      });
      player.addListener("ready", ({ device_id }) => {
        console.log("Ready with Device ID", device_id);
        setTimeout(() => {
          fetch("https://api.spotify.com/v1/me/player", {
            method: "PUT",
            body: JSON.stringify({ device_ids: [device_id], play: false }),
            headers: { "Authorization": `Bearer ${accessToken}` }
          }).catch((e) => console.error(e));
        }, 100);
      });
      player.addListener("not_ready", ({ device_id }) => {
        console.log("Device ID has gone offline", device_id);
      });
      player.connect();
    };
  };
  const getAudioAnalysis = ({ id }) => {
    if (trackAnalysisAcquired === false) {
      spotifyApi.getAudioAnalysisForTrack(id).then((data) => {
        dispatch("audioAnalysisComplete", { data });
        trackAnalysisAcquired = true;
      });
    }
  };
  return ``;
});
function WorkerWrapper() {
  return new Worker("/_app/assets/timbre1dWorker.63b9bc29.js", {
    "type": "module"
  });
}
var css$2 = {
  code: ".sketch.svelte-q6ubty{position:absolute;min-width:100vw;min-height:100vh;overflow:hidden}.webgl-canvas.svelte-q6ubty{position:fixed;width:100%;height:100%;top:0;left:0;margin:0;border:0px}",
  map: `{"version":3,"file":"index.svelte","sources":["index.svelte"],"sourcesContent":["<script>\\n\\n    import {onMount, tick} from 'svelte';\\n    import {ACCESSTOKENKEY} from \\"$lib/_globals\\";\\n    import {soundScape} from '$lib/sketches/soundScape/soundScape.js';\\n    import SpotifyAuthentication from \\"$lib/utils/SpotifyAuthentication.svelte\\";\\n    import SpotifyPlayer from \\"$lib/utils/SpotifyPlayer.svelte\\";\\n\\n    import Timbre1DWorker from '$lib/workers/soundScape/timbre1dWorker.js?worker';\\n\\n    //--------------------------------\\n\\n    let el;\\n    let canvas;\\n    let sketch;\\n\\n    let containerWidth = 2;\\n    let containerHeight = 2;\\n\\n    let time = 0;\\n    let deltaTime = 0;\\n    let prevTime = 0;\\n\\n    let spotifySDK;\\n    let player;\\n    let accessToken = null;\\n    let timbre1dworker;\\n\\n    //--------------------------------\\n\\n    onMount(async () => {\\n\\n        initTimbre1DWorker();\\n\\n        accessToken = localStorage.getItem(ACCESSTOKENKEY);\\n\\n        await tick();\\n\\n        // sketch = new soundScape({el: canvas});\\n\\n        handleTick();\\n\\n    });\\n\\n    const initTimbre1DWorker = () => {\\n\\n        timbre1dworker = new Timbre1DWorker();\\n        timbre1dworker.onmessage = (event) => {\\n            console.log(event.data);\\n        };\\n\\n    }\\n\\n    const handleAccessTokenRecieved = (event) => {\\n\\n        const {token} = event.detail;\\n        accessToken = token;\\n        localStorage.setItem(ACCESSTOKENKEY, accessToken);\\n\\n    }\\n\\n    const handleAvaiableAudioAnalysisComplete = (event) => {\\n\\n        const {data} = event.detail;\\n\\n        timbre1dworker.postMessage(data);\\n\\n    }\\n\\n    const updateClock = () => {\\n\\n        time = performance.now();\\n        deltaTime = (time - prevTime) * 0.001;\\n        prevTime = time;\\n\\n    }\\n\\n    const handleTick = () => {\\n        window.requestAnimationFrame(() => handleTick());\\n        updateClock();\\n\\n        // player.getCurrentState().then((state) => {\\n        //     if(!state) {\\n        //         console.log('no music is being played');\\n        //     }\\n        //\\n        // })\\n\\n        // sketch.update({time, deltaTime});\\n\\n    }\\n\\n    const handleResize = () => {\\n        sketch.onresize({width: containerWidth, height: containerHeight})\\n    }\\n\\n<\/script>\\n\\n<svelte:head>\\n</svelte:head>\\n\\n<svelte:window on:resize={handleResize}/>\\n\\n<main class=sketch bind:this={el} bind:clientWidth={containerWidth} bind:clientHeight={containerHeight}>\\n        <canvas class=webgl-canvas bind:this={canvas}></canvas>\\n    {#if accessToken === null}\\n        <SpotifyAuthentication on:accessTokenRecieved={handleAccessTokenRecieved}/>\\n        {:else}\\n        <SpotifyPlayer on:audioAnalysisComplete={handleAvaiableAudioAnalysisComplete}/>\\n    {/if}\\n</main>\\n\\n<style lang=scss>.sketch {\\n  position: absolute;\\n  min-width: 100vw;\\n  min-height: 100vh;\\n  overflow: hidden;\\n}\\n\\n.webgl-canvas {\\n  position: fixed;\\n  width: 100%;\\n  height: 100%;\\n  top: 0;\\n  left: 0;\\n  margin: 0;\\n  border: 0px;\\n}</style>\\n"],"names":[],"mappings":"AAgHiB,OAAO,cAAC,CAAC,AACxB,QAAQ,CAAE,QAAQ,CAClB,SAAS,CAAE,KAAK,CAChB,UAAU,CAAE,KAAK,CACjB,QAAQ,CAAE,MAAM,AAClB,CAAC,AAED,aAAa,cAAC,CAAC,AACb,QAAQ,CAAE,KAAK,CACf,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,GAAG,CAAE,CAAC,CACN,IAAI,CAAE,CAAC,CACP,MAAM,CAAE,CAAC,CACT,MAAM,CAAE,GAAG,AACb,CAAC"}`
};
var SoundScape = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let el;
  let canvas;
  let accessToken = null;
  let timbre1dworker;
  onMount(async () => {
    initTimbre1DWorker();
    accessToken = localStorage.getItem(ACCESSTOKENKEY);
    await tick();
    handleTick();
  });
  const initTimbre1DWorker = () => {
    timbre1dworker = new WorkerWrapper();
    timbre1dworker.onmessage = (event) => {
      console.log(event.data);
    };
  };
  const updateClock = () => {
    performance.now();
  };
  const handleTick = () => {
    window.requestAnimationFrame(() => handleTick());
    updateClock();
  };
  $$result.css.add(css$2);
  return `${$$result.head += ``, ""}



<main class="${"sketch svelte-q6ubty"}"${add_attribute("this", el, 1)}><canvas class="${"webgl-canvas svelte-q6ubty"}"${add_attribute("this", canvas, 1)}></canvas>
    ${accessToken === null ? `${validate_component(SpotifyAuthentication, "SpotifyAuthentication").$$render($$result, {}, {}, {})}` : `${validate_component(SpotifyPlayer, "SpotifyPlayer").$$render($$result, {}, {}, {})}`}
</main>`;
});
var index = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": SoundScape
});
var vertex$5 = `
                    precision highp float;
                    attribute vec3 position;
                    #ifdef UV
                        attribute vec2 uv;
                    #else
                        const vec2 uv = vec2(0);
                    #endif
                    #ifdef NORMAL
                        attribute vec3 normal;
                    #else
                        const vec3 normal = vec3(0);
                    #endif
                    #ifdef INSTANCED
                        attribute mat4 instanceMatrix;
                    #endif
                    #ifdef SKINNING
                        attribute vec4 skinIndex;
                        attribute vec4 skinWeight;
                    #endif
                    uniform mat4 modelViewMatrix;
                    uniform mat4 projectionMatrix;
                    uniform mat4 modelMatrix;
                    uniform mat3 normalMatrix;

                    uniform vec3 _Forward;
                    uniform vec3 _WorldPosOffset;

                    vec3 rotateToTarget(vec3 forward, vec3 p) {

                        vec3 up = vec3(0.0, 1.0, 0.0);
                        vec3 right = normalize(cross(forward, up));

                        return (right * p.x) + (up * p.y) + (forward * p.z);

                    }

                    #ifdef SKINNING
                        uniform sampler2D boneTexture;
                        uniform int boneTextureSize;
                    #endif
                    varying vec2 vUv;
                    varying vec3 vNormal;
                    varying vec3 vMPos;
                    varying vec4 vMVPos;

                    #ifdef SKINNING
                        mat4 getBoneMatrix(const in float i) ${`{`}
                            float j = i * 4.0;
                            float x = mod(j, float(boneTextureSize));
                            float y = floor(j / float(boneTextureSize));
                            float dx = 1.0 / float(boneTextureSize);
                            float dy = 1.0 / float(boneTextureSize);
                            y = dy * (y + 0.5);
                            vec4 v1 = texture2D(boneTexture, vec2(dx * (x + 0.5), y));
                            vec4 v2 = texture2D(boneTexture, vec2(dx * (x + 1.5), y));
                            vec4 v3 = texture2D(boneTexture, vec2(dx * (x + 2.5), y));
                            vec4 v4 = texture2D(boneTexture, vec2(dx * (x + 3.5), y));
                            return mat4(v1, v2, v3, v4);
                        }
                        void skin(inout vec4 pos, inout vec3 nml) ${`{`}
                            mat4 boneMatX = getBoneMatrix(skinIndex.x);
                            mat4 boneMatY = getBoneMatrix(skinIndex.y);
                            mat4 boneMatZ = getBoneMatrix(skinIndex.z);
                            mat4 boneMatW = getBoneMatrix(skinIndex.w);
                            // update normal
                            mat4 skinMatrix = mat4(0.0);
                            skinMatrix += skinWeight.x * boneMatX;
                            skinMatrix += skinWeight.y * boneMatY;
                            skinMatrix += skinWeight.z * boneMatZ;
                            skinMatrix += skinWeight.w * boneMatW;
                            nml = vec4(skinMatrix * vec4(nml, 0.0)).xyz;
                            // Update position
                            vec4 transformed = vec4(0.0);
                            transformed += boneMatX * pos * skinWeight.x;
                            transformed += boneMatY * pos * skinWeight.y;
                            transformed += boneMatZ * pos * skinWeight.z;
                            transformed += boneMatW * pos * skinWeight.w;
                            pos = transformed;
                        }
                    #endif
                    void main() ${`{`}
                        vec4 pos = vec4(position, 1);

                        vec3 nml = normal;
                        #ifdef SKINNING
                            skin(pos, nml);
                            pos.xyz = rotateToTarget(_Forward, pos.xyz);
                            nml.xyz = rotateToTarget(_Forward, nml.xyz);
                        #endif
                        #ifdef INSTANCED
                            pos = instanceMatrix * pos;
                            mat3 m = mat3(instanceMatrix);
                            nml /= vec3(dot(m[0], m[0]), dot(m[1], m[1]), dot(m[2], m[2]));
                            nml = m * nml;
                        #endif
                        vUv = uv;
                        vNormal = normalize(normalMatrix * nml);
                        pos.xyz += _WorldPosOffset;
                        vec4 mPos = modelMatrix * pos;
                        vMPos = mPos.xyz / mPos.w;
                        vMVPos = modelViewMatrix * pos;
                        gl_Position = projectionMatrix * vMVPos;
                    }
                    `;
var fragment$2 = "precision highp float;\r\n\r\nvarying vec3 vNormal;\r\n\r\n#define LIGHTPOS vec3(1.0, 1.0, 1.0)\r\n\r\nvoid main() {\r\n\r\n    vec3 col = vec3(1.0);\r\n\r\n    float halfLambert = dot((vNormal), normalize(LIGHTPOS)) * 0.5 + 0.5;\r\n\r\n\r\n    gl_FragColor = vec4(vec3(halfLambert), 1.0);\r\n\r\n}";
var KodamaMesh = class extends Transform {
  constructor(gl, {
    gltf
  }) {
    super(gl);
    this.gl = gl;
    this.gltf = gltf;
    this.mesh;
    this.skin;
    this.loadGLTF();
    this.currentPos = new Vec3(0, 0, 0);
    this.prevPos = new Vec3(0, 0, 0);
    this.velocity = new Vec3(0, 0, 0);
    this.acc = new Vec3(0, 0, 0);
    this.directionOffset = new Vec3(0, 0, 0);
    this.directionOffsetRadius = 2;
    this.directionStep = 2;
    this.PI2 = Math.PI * 2;
    this.updateDirection = false;
    this.randomAngle = Math.random() * this.PI2;
  }
  loadGLTF() {
    this.children.forEach((child) => child.setParent(null));
    const s2 = this.gltf.scene || this.gltf.scenes[0];
    s2.forEach((root) => {
      root.setParent(this);
      root.traverse((node) => {
        if (node.program) {
          node.program = this.createProgram(node);
        }
      });
    });
    this.updateMatrixWorld();
    const min = new Vec3(Infinity);
    const max = new Vec3(-Infinity);
    const center = new Vec3();
    const scale2 = new Vec3();
    const boundsMin = new Vec3();
    const boundsMax = new Vec3();
    const boundsCenter = new Vec3();
    const boundsScale = new Vec3();
    console.log(this.gltf.meshes);
    this.gltf.meshes.forEach((group) => {
      group.primitives.forEach((mesh) => {
        if (!mesh.parent)
          return;
        if (!mesh.geometry.bounds)
          mesh.geometry.computeBoundingSphere();
        boundsCenter.copy(mesh.geometry.bounds.center).applyMatrix4(mesh.worldMatrix);
        mesh.worldMatrix.getScaling(boundsScale);
        const radiusScale = Math.max(Math.max(boundsScale[0], boundsScale[1]), boundsScale[2]);
        const radius = mesh.geometry.bounds.radius * radiusScale;
        boundsMin.set(-radius).add(boundsCenter);
        boundsMax.set(+radius).add(boundsCenter);
        for (let i = 0; i < 3; i++) {
          min[i] = Math.min(min[i], boundsMin[i]);
          max[i] = Math.max(max[i], boundsMax[i]);
        }
        this.mesh = mesh;
      });
    });
    scale2.sub(max, min);
    Math.max(Math.max(scale2[0], scale2[1]), scale2[2]) * 0.5;
    center.add(min, max).divide(2);
  }
  createProgram(node) {
    let defines = `
        ${node.geometry.attributes.uv ? `#define UV` : ``}
        ${node.geometry.attributes.normal ? `#define NORMAL` : ``}
        ${node.geometry.isInstanced ? `#define INSTANCED` : ``}
        ${node.boneTexture ? `#define SKINNING` : ``}
        ${this.gltf.alphaMode === "MASK" ? `#define ALPHA_MASK` : ``}
        ${this.gltf.baseColorTexture ? `#define COLOR_MAP` : ``}
        ${this.gltf.normalTexture ? `#define NORMAL_MAP` : ``}
        ${this.gltf.metallicRoughnessTexture ? `#define RM_MAP` : ``}
        ${this.gltf.occlusionTexture ? `#define OCC_MAP` : ``}
        ${this.gltf.emissiveTexture ? `#define EMISSIVE_MAP` : ``}
    `;
    let v = defines + vertex$5;
    let f = defines + fragment$2;
    const uniforms = {
      _Forward: {
        value: new Vec3(0, 0, 1)
      },
      _WorldPosOffset: {
        value: new Vec3(0, 0, 0)
      }
    };
    const program = new Program(this.gl, {
      uniforms,
      vertex: v,
      fragment: f,
      cullFace: null
    });
    return program;
  }
  wander({ time }) {
    if (Math.floor(time * 1e-3) % this.directionStep === 0) {
      if (this.updateDirection === false) {
        console.log("UPDATE DIRECTION");
        this.updateDirection = true;
        this.randomAngle = Math.random() * this.PI2;
      }
    } else {
      this.updateDirection = false;
    }
    this.directionOffset.set(Math.cos(this.randomAngle) * this.directionOffsetRadius, 0, Math.sin(this.randomAngle) * this.directionOffsetRadius);
    const offset = new Vec3().copy(this.currentPos).sub(this.prevPos).normalize().scale(4).add(this.directionOffset);
    const target = new Vec3().copy(this.currentPos).add(offset).sub(this.currentPos);
    target.scale(0.015);
    this.prevPos.copy(this.currentPos);
    this.currentPos.add(target);
    this.Mesh.program.uniforms._Forward.value.copy(this.currentPos).sub(this.prevPos).normalize();
    this.Mesh.program.uniforms._WorldPosOffset.value.copy(this.currentPos);
  }
  animate() {
    if (this.gltf && this.gltf.animations && this.gltf.animations.length) {
      let { animation } = this.gltf.animations[0];
      animation.elapsed += 0.01;
      animation.update();
    }
  }
  update({ time, deltaTime }) {
    this.wander({ time });
    this.animate();
  }
  get Mesh() {
    return this.mesh;
  }
};
var wandering$1 = class {
  constructor({ el }) {
    __publicField(this, "loadModel", async () => {
      this.gltf = await GLTFLoader.load(this.gl, "src/lib/sketches/wandering/assets/kodamav2_no_material_small.gltf");
      this.kodamaMesh = new KodamaMesh(this.gl, {
        gltf: this.gltf
      });
      this.kodamaMesh.setParent(this.scene);
      this.kodamaMesh.position.y -= 1;
    });
    this.init({ el });
  }
  init({ el }) {
    this.renderer = new Renderer({
      canvas: el,
      width: el.clientWidth,
      height: el.clientHeight,
      antialias: true,
      dpr: 1
    });
    this.gl = this.renderer.gl;
    const bg = 0.93;
    this.gl.clearColor(bg, bg, bg, 1);
    const {
      clientWidth,
      clientHeight
    } = this.gl.canvas;
    this.wk = 1 / clientWidth;
    this.hK = 1 / clientHeight;
    this.camera = new Camera(this.gl, {
      aspect: clientWidth / clientHeight
    });
    this.camera.position.x = 0;
    this.camera.position.y = 10;
    this.camera.position.z = 10;
    this.controls = new Orbit(this.camera, {
      target: new Vec3(0, 0, 0)
    });
    this.scene = new Transform();
    this.gltf;
    const image = new Image();
    image.crossOrigin = "*";
    image.src = "src/lib/sketches/wandering/assets/metallicvoxels.png";
    this.loadModel();
  }
  render({
    scene,
    camera = null,
    target = null,
    clear
  }) {
    this.renderer.render({
      scene,
      camera,
      clear
    });
  }
  update({
    time,
    deltaTime
  }) {
    this.controls.update();
    if (this.kodamaMesh)
      this.kodamaMesh.update({ time, deltaTime });
    this.render({
      scene: this.scene,
      camera: this.camera,
      clear: true
    });
  }
  onResize(width, height) {
    if (width && height) {
      this.renderer.setSize(width, height);
      const {
        clientWidth,
        clientHeight
      } = this.gl.canvas;
      this.wk = 1 / clientWidth;
      this.hK = 1 / clientHeight;
      this.camera.perspective({
        aspect: clientWidth / clientHeight
      });
    }
  }
};
var css$1 = {
  code: ".sketch.svelte-q6ubty{position:absolute;min-width:100vw;min-height:100vh;overflow:hidden}.webgl-canvas.svelte-q6ubty{position:fixed;width:100%;height:100%;top:0;left:0;margin:0;border:0px}",
  map: `{"version":3,"file":"wandering.svelte","sources":["wandering.svelte"],"sourcesContent":["<script>\\n    \\n    import { onMount, tick } from 'svelte';\\n    import {wandering} from '$lib/sketches/wandering/wandering.js';\\n    \\n    //--------------------------------\\n            \\n    let el;\\n    let canvas;\\n    let sketch;\\n\\n    let containerWidth = 2;\\n    let containerHeight = 2;\\n\\n    let time = 0;\\n    let deltaTime = 0;\\n    let prevTime = 0;\\n    \\n    //--------------------------------\\n    \\n    onMount(async()=> {\\n        \\n        await tick();\\n\\n        sketch = new wandering({el: canvas});\\n\\n        handleTick();\\n            \\n    });\\n\\n    const updateClock = () => {\\n\\n        time = performance.now();\\n        deltaTime = (time - prevTime) * 0.001;\\n        prevTime = time;\\n\\n    }\\n\\n    const handleTick = () => {\\n        window.requestAnimationFrame(() => handleTick());\\n        updateClock();\\n        sketch.update({time, deltaTime});\\n\\n    }\\n\\n    const handleResize = () => {\\n        sketch.onresize({width: containerWidth, height: containerHeight})\\n    }\\n    \\n<\/script>\\n\\n<svelte:window on:resize={handleResize} />\\n    \\n<main class=sketch bind:this={el} bind:clientWidth={containerWidth} bind:clientHeight={containerHeight}>\\n    <canvas class=webgl-canvas bind:this={canvas}></canvas>\\n</main>\\n    \\n<style lang=scss>.sketch {\\n  position: absolute;\\n  min-width: 100vw;\\n  min-height: 100vh;\\n  overflow: hidden;\\n}\\n\\n.webgl-canvas {\\n  position: fixed;\\n  width: 100%;\\n  height: 100%;\\n  top: 0;\\n  left: 0;\\n  margin: 0;\\n  border: 0px;\\n}</style>\\n"],"names":[],"mappings":"AAyDiB,OAAO,cAAC,CAAC,AACxB,QAAQ,CAAE,QAAQ,CAClB,SAAS,CAAE,KAAK,CAChB,UAAU,CAAE,KAAK,CACjB,QAAQ,CAAE,MAAM,AAClB,CAAC,AAED,aAAa,cAAC,CAAC,AACb,QAAQ,CAAE,KAAK,CACf,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,GAAG,CAAE,CAAC,CACN,IAAI,CAAE,CAAC,CACP,MAAM,CAAE,CAAC,CACT,MAAM,CAAE,GAAG,AACb,CAAC"}`
};
var Wandering = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let el;
  let canvas;
  let sketch;
  let time = 0;
  let deltaTime = 0;
  let prevTime = 0;
  onMount(async () => {
    await tick();
    sketch = new wandering$1({ el: canvas });
    handleTick();
  });
  const updateClock = () => {
    time = performance.now();
    deltaTime = (time - prevTime) * 1e-3;
    prevTime = time;
  };
  const handleTick = () => {
    window.requestAnimationFrame(() => handleTick());
    updateClock();
    sketch.update({ time, deltaTime });
  };
  $$result.css.add(css$1);
  return `
    
<main class="${"sketch svelte-q6ubty"}"${add_attribute("this", el, 1)}><canvas class="${"webgl-canvas svelte-q6ubty"}"${add_attribute("this", canvas, 1)}></canvas>
</main>`;
});
var wandering = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Wandering
});
var vertex$4 = "precision highp float;\r\n\r\nattribute vec3 position;\r\nattribute vec3 normal;\r\n\r\nuniform mat4 projectionMatrix;\r\nuniform mat4 modelViewMatrix;\r\n\r\nvarying vec3 vNormal;\r\n\r\nvoid main() {\r\n\r\n    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n    vNormal = normal;\r\n\r\n}\r\n";
var fragment$1 = "precision highp float;\r\n\r\nvarying vec3 vNormal;\r\n\r\nvoid main() {\r\n\r\n    gl_FragColor = vec4(vNormal * 0.5 + 0.5, 1.0);\r\n//    gl_FragColor = vec4(vec3(1.0, 0.5, 0.12), 1.0);\r\n\r\n}";
var SphereMesh = class extends Mesh {
  constructor(gl) {
    super(gl);
    this.gl = gl;
    this.geometry = new Torus(this.gl, {
      radius: 0.8,
      widthSegments: 64,
      heightSegments: 32
    });
    this.program = new Program(this.gl, {
      vertex: vertex$4,
      fragment: fragment$1
    });
  }
};
var vertex$3 = "precision highp float;\r\n\r\nattribute vec2 position;\r\nattribute vec2 uv;\r\n\r\nvarying vec2 vUv;\r\n\r\nvoid main() {\r\n\r\n    gl_Position = vec4(position, 0.0, 1.0);\r\n\r\n    vUv = uv;\r\n\r\n}";
var fxaa = "precision highp float;\r\n// Default uniform for previous pass is 'tMap'.\r\n// Can change this using the 'textureUniform' property\r\n// when adding a pass.\r\nuniform sampler2D tMap;\r\nuniform vec2 _Resolution;\r\nvarying vec2 vUv;\r\n\r\nfloat luma(vec4 color) {\r\n    return dot(color.xyz, vec3(0.299, 0.587, 0.114));\r\n}\r\n\r\nvec4 fxaa(sampler2D tex, vec2 uv, vec2 resolution) {\r\n    vec2 pixel = vec2(1) / resolution;\r\n    vec3 l = vec3(0.299, 0.587, 0.114);\r\n    float lNW = dot(texture2D(tex, uv + vec2(-1, -1) * pixel).rgb, l);\r\n    float lNE = dot(texture2D(tex, uv + vec2( 1, -1) * pixel).rgb, l);\r\n    float lSW = dot(texture2D(tex, uv + vec2(-1,  1) * pixel).rgb, l);\r\n    float lSE = dot(texture2D(tex, uv + vec2( 1,  1) * pixel).rgb, l);\r\n    float lM  = dot(texture2D(tex, uv).rgb, l);\r\n    float lMin = min(lM, min(min(lNW, lNE), min(lSW, lSE)));\r\n    float lMax = max(lM, max(max(lNW, lNE), max(lSW, lSE)));\r\n\r\n    vec2 dir = vec2(\r\n    -((lNW + lNE) - (lSW + lSE)),\r\n    ((lNW + lSW) - (lNE + lSE))\r\n    );\r\n\r\n    float dirReduce = max((lNW + lNE + lSW + lSE) * 0.03125, 0.0078125);\r\n    float rcpDirMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);\r\n    dir = min(vec2(8, 8), max(vec2(-8, -8), dir * rcpDirMin)) * pixel;\r\n\r\n\r\n    //the inclusion of alpha is based on THREE's take on FXAA\r\n    //https://github.com/assiprinz/threejs-unreal-post/blob/master/js/shaders/FXAAShader.js\r\n    vec4 rgbA = 0.5 * (\r\n    texture2D(tex, uv + dir * (1.0 / 3.0 - 0.5)) +\r\n    texture2D(tex, uv + dir * (2.0 / 3.0 - 0.5)));\r\n    vec4 rgbB = rgbA * 0.5 + 0.25 * (\r\n    texture2D(tex, uv + dir * -0.5) +\r\n    texture2D(tex, uv + dir * 0.5));\r\n    float lB = dot(rgbB, vec4(l, 0.0));\r\n    return mix(\r\n    vec4(rgbB),\r\n    vec4(rgbA),\r\n    max(sign(lB - lMin), 0.0) * max(sign(lB - lMax), 0.0)\r\n    );\r\n}\r\nvoid main() {\r\n    vec4 aa = fxaa(tMap, vUv, _Resolution);\r\n    gl_FragColor = aa;\r\n}";
var FxaaPass = class {
  constructor(gl) {
    this.gl = gl;
    this.createRenderTarget();
    this.initProgram();
  }
  createRenderTarget() {
    return new RenderTarget(this.gl);
  }
  initProgram() {
    const uniforms = {
      tMap: {
        value: new Texture(this.gl)
      },
      _Resolution: {
        value: new Vec2(this.gl.canvas.width, this.gl.canvas.height)
      }
    };
    this.colorPass = new Mesh(this.gl, {
      geometry: new Triangle(this.gl),
      program: new Program(this.gl, {
        uniforms,
        vertex: vertex$3,
        fragment: fxaa,
        depthWrite: false,
        depthTest: false,
        cullFace: null
      })
    });
    this.colorPassTarget = new RenderTarget(this.gl);
  }
  render({ pass }) {
    this.colorPass.program.uniforms.tMap.value = pass;
    this.gl.renderer.render({ scene: this.colorPass, target: this.colorPassTarget, clear: false });
  }
  onResize({ width, height }) {
    this.colorPassTarget = this.createRenderTarget();
    this.colorPass.program.uniforms._Resolution.value.set(this.gl.canvas.width, this.gl.canvas.height);
  }
  get Output() {
    return this.colorPassTarget.texture;
  }
  get EmissiveMask() {
    return this.emissivePassTarget.texture;
  }
};
var vertex$2 = "precision highp float;\r\n\r\nattribute vec2 position;\r\nattribute vec2 uv;\r\n\r\nvarying vec2 vUv;\r\n\r\nvoid main() {\r\n\r\n    gl_Position = vec4(position, 0.0, 1.0);\r\n    vUv = uv;\r\n}";
var blur_downsample = "precision highp float;\r\n\r\nuniform sampler2D _Image;\r\nuniform vec2 _Resolution;\r\n\r\nuniform float _StepSize;\r\nuniform float _Time;\r\n\r\nuniform float _Seed;\r\n\r\nvarying vec2 vUv;\r\n\r\n\r\nfloat hash12(vec2 p)\r\n{\r\n	vec3 p3  = fract(vec3(p.xyx) * .1031);\r\n    p3 += dot(p3, p3.yzx + 33.33);\r\n    return fract((p3.x + p3.y) * p3.z);\r\n}\r\n\r\nvec3 hash32(vec2 p)\r\n{\r\n	vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));\r\n    p3 += dot(p3, p3.yxz+33.33);\r\n    return fract((p3.xxy+p3.yzz)*p3.zyx);\r\n}\r\n\r\nvec3 lin2srgb(vec3 c) {\r\n    return sqrt(c);\r\n}\r\n\r\nvec3 srgb2lin(vec3 c) {\r\n    return c * c;\r\n}\r\n\r\nvoid main() {\r\n    \r\n    vec2 texelSize = 1.0 / _Resolution;\r\n\r\n    vec3 col = texture2D(_Image, vUv).xyz * 4.0;\r\n    col += texture2D(_Image, vUv + texelSize * _StepSize).xyz;\r\n    col += texture2D(_Image, vUv + vec2(texelSize.x, -texelSize.y) * _StepSize).xyz;\r\n    col += texture2D(_Image, vUv - texelSize * _StepSize).xyz;\r\n    col += texture2D(_Image, vUv + vec2(-texelSize.x, +texelSize.y) * _StepSize).xyz;\r\n    col /= 8.0;\r\n\r\n    vec3 hash1 = hash32(gl_FragCoord.xy+fract(_Time)*1651.0 + _Seed);\r\n    vec3 hash2 = hash32(gl_FragCoord.yx+fract(_Time+0.3123)*1213.0 + _Seed);\r\n    vec3 dither = ((hash1) + (hash2-1.0)) / 255.0;\r\n\r\n    // Output to screen\r\n    gl_FragColor = vec4(col+dither,1.0);\r\n\r\n}";
var blur_upsample = "precision highp float;\r\n\r\nuniform sampler2D _Image;\r\nuniform vec2 _Resolution;\r\n\r\nuniform float _StepSize;\r\nuniform float _Time;\r\n\r\nuniform float _Seed;\r\n\r\nvarying vec2 vUv;\r\n\r\n\r\nfloat hash12(vec2 p)\r\n{\r\n	vec3 p3  = fract(vec3(p.xyx) * .1031);\r\n    p3 += dot(p3, p3.yzx + 33.33);\r\n    return fract((p3.x + p3.y) * p3.z);\r\n}\r\n\r\nvec3 hash32(vec2 p)\r\n{\r\n	vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));\r\n    p3 += dot(p3, p3.yxz+33.33);\r\n    return fract((p3.xxy+p3.yzz)*p3.zyx);\r\n}\r\n\r\nvoid main() {\r\n    \r\n    vec2 texelSize = 1.0 / _Resolution;\r\n\r\n    vec2 texelSizeHalf = texelSize * 0.5;\r\n\r\n    vec3 col = texture2D(_Image, vUv + vec2(-texelSizeHalf.x * 2.0, 0.0)*_StepSize).xyz;\r\n    col += texture2D(_Image, vUv + vec2(-texelSizeHalf.x, texelSizeHalf.y)*_StepSize).xyz * 2.0;\r\n    col += texture2D(_Image, vUv + vec2(0.0, texelSizeHalf.y * 2.0)*_StepSize).xyz;\r\n    col += texture2D(_Image, vUv + vec2(texelSizeHalf.x, texelSizeHalf.y)*_StepSize).xyz * 2.0;\r\n    col += texture2D(_Image, vUv + vec2(texelSizeHalf.x * 2.0, 0.0)*_StepSize).xyz;\r\n    col += texture2D(_Image, vUv + vec2(texelSizeHalf.x, -texelSizeHalf.y)*_StepSize).xyz * 2.0;\r\n    col += texture2D(_Image, vUv + vec2(0.0, -texelSizeHalf.y * 2.0)*_StepSize).xyz;\r\n    col += texture2D(_Image, vUv + vec2(-texelSizeHalf.x, -texelSizeHalf.y)*_StepSize).xyz * 2.0;\r\n\r\n    col /= 12.0;\r\n\r\n    vec3 hash1 = hash32(gl_FragCoord.xy+fract(_Time)*1351.0 + _Seed);\r\n    vec3 hash2 = hash32(gl_FragCoord.yx+fract(_Time+0.3123)*1713.0 + _Seed);\r\n    vec3 dither = ((hash1) + (hash2-1.0)) / 255.0;\r\n\r\n    // Output to screen\r\n    gl_FragColor = vec4(col+dither,1.0);\r\n\r\n}";
var DualFilterBlurPass = class {
  constructor(gl, {
    width,
    height
  }) {
    this.gl = gl;
    this.resolutionScale = 0.5;
    this.setSize({ width, height });
    this.initBlurPasses();
  }
  initBlurPasses() {
    this.createBlurBuffers();
    const uniforms = {
      _Image: {
        value: new Texture(this.gl)
      },
      _StepSize: {
        value: 1
      },
      _Time: {
        value: 0
      },
      _Resolution: {
        value: new Vec2(Math.floor(this.width * this.resolutionScale), Math.floor(this.height * this.resolutionScale))
      },
      _Seed: {
        value: 0
      }
    };
    this.downsamplePass = new Mesh(this.gl, {
      geometry: new Triangle(this.gl),
      program: new Program(this.gl, {
        vertex: vertex$2,
        fragment: blur_downsample,
        uniforms,
        transparent: false,
        depthTest: false,
        depthWrite: false
      })
    });
    this.upsamplePass = new Mesh(this.gl, {
      geometry: new Triangle(this.gl),
      program: new Program(this.gl, {
        vertex: vertex$2,
        fragment: blur_upsample,
        uniforms,
        transparent: false,
        depthTest: false,
        depthWrite: false
      })
    });
  }
  render({ pass, time }) {
    for (let i = 0; i < this.blurBuffers.length - 1; i++) {
      if (i === 0) {
        this.downsamplePass.program.uniforms._Image.value = pass.texture;
        this.downsamplePass.program.uniforms._Resolution.value.set(pass.width, pass.height);
      } else {
        this.downsamplePass.program.uniforms._Image.value = this.blurBuffers[i].buffer.texture;
        this.downsamplePass.program.uniforms._Resolution.value.copy(this.blurBuffers[i].resolution);
      }
      this.downsamplePass.program.uniforms._Seed.value = i * 100 * Math.random();
      this.downsamplePass.program.uniforms._Time.value = time;
      this.gl.renderer.render({ scene: this.downsamplePass, target: this.blurBuffers[i + 1].buffer, clear: false });
    }
    for (let i = this.blurBuffers.length - 1; i > 0; i--) {
      this.upsamplePass.program.uniforms._Image.value = this.blurBuffers[i].buffer.texture;
      this.upsamplePass.program.uniforms._Resolution.value.copy(this.blurBuffers[i].resolution);
      this.upsamplePass.program.uniforms._Time.value = time;
      this.upsamplePass.program.uniforms._Seed.value = i * 100 * Math.random();
      this.gl.renderer.render({ scene: this.upsamplePass, target: this.blurBuffers[i - 1].buffer, clear: false });
    }
  }
  createBlurBuffers() {
    const bufferCount = 4;
    this.blurBuffers = new Array(bufferCount);
    let scale2 = 1;
    for (let i = 0; i < this.blurBuffers.length; i++) {
      const textureParams = {
        width: Math.floor(this.width * this.resolutionScale * scale2),
        height: Math.floor(this.height * this.resolutionScale * scale2),
        minFilter: this.gl.LINEAR,
        magFilter: this.gl.LINEAR,
        format: this.gl.RGB,
        internalFormat: this.gl.RGB,
        depth: false
      };
      this.blurBuffers[i] = {
        buffer: new RenderTarget(this.gl, textureParams),
        resolution: new Vec2(textureParams.width, textureParams.height)
      };
      scale2 *= 0.5;
    }
  }
  onResize({ width, height }) {
    this.setSize({ width, height });
    this.createBlurBuffers();
  }
  setSize({ width, height }) {
    this.width = width === null ? this.gl.canvas.width : width;
    this.height = height === null ? this.gl.canvas.height : height;
  }
  get Output() {
    return this.blurBuffers[0].buffer.texture;
  }
};
var vertex$1 = "precision highp float;\r\n\r\nattribute vec2 position;\r\nattribute vec2 uv;\r\n\r\nvarying vec2 vUv;\r\n\r\nvoid main() {\r\n\r\n    gl_Position = vec4(position, 0.0, 1.0);\r\n\r\n    vUv = uv;\r\n\r\n}\r\n";
var fragment = "precision highp float;\r\n\r\nuniform sampler2D _FxaaPassOutput;\r\nuniform sampler2D _BlooomPassOutput;\r\n\r\nuniform float _Time;\r\n\r\nvarying vec2 vUv;\r\n\r\nvec3 hash32(vec2 p)\r\n{\r\n    vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));\r\n    p3 += dot(p3, p3.yxz+33.33);\r\n    return fract((p3.xxy+p3.yzz)*p3.zyx);\r\n}\r\n\r\nvec3 screenBlend(vec3 a, vec3 b) {\r\n\r\n    return 1.0 - ((1.0 - a) * (1.0 - b));\r\n\r\n}\r\n\r\nvoid main() {\r\n\r\n    vec3 fxaaPass = texture2D(_FxaaPassOutput, vUv).xyz;\r\n    vec3 bloomPass = texture2D(_BlooomPassOutput, vUv).xyz;\r\n\r\n    vec3 finalCol = screenBlend(fxaaPass, bloomPass);\r\n\r\n    vec3 hash1 = hash32(gl_FragCoord.xy+fract(_Time)*1300.0);\r\n    vec3 hash2 = hash32(gl_FragCoord.yx+fract(_Time+0.3123)*1300.0);\r\n    vec3 dither = ((hash1) + (hash2-1.0)) / 255.0;\r\n\r\n    gl_FragColor = vec4(finalCol + dither, 1.0);\r\n\r\n}";
var capture = "precision highp float;\r\n\r\nuniform sampler2D _Pass;\r\nvarying vec2 vUv;\r\n\r\nvoid main() {\r\n\r\n    vec4 col = texture2D(_Pass, vUv);\r\n    gl_FragColor = col;\r\n\r\n}";
var lumaMask = "precision highp float;\r\n\r\nuniform sampler2D _ColorPass;\r\n\r\nuniform float _BrightnessThreshold;\r\nuniform float _SmoothWidth;\r\nuniform float _Intensity;\r\n\r\nvarying vec2 vUv;\r\n\r\n#define CLEARCOL vec3(0.0, 0.0, 0.0)\r\n\r\nfloat luma(vec3 color) {\r\n    return dot(color, vec3(0.299, 0.587, 0.114));\r\n}\r\n\r\nfloat luma(vec4 color) {\r\n    return dot(color.xyz, vec3(0.299, 0.587, 0.114));\r\n}\r\n\r\n//remix of following implementation:\r\n//https://github.com/mrdoob/three.js/blob/342946c8392639028da439b6dc0597e58209c696/examples/js/shaders/LuminosityHighPassShader.js\r\nvoid main() {\r\n\r\n    vec4 col = texture2D(_ColorPass, vUv).xyzw;\r\n    col.xyz = mix(vec3(0.0), col.xyz, col.w);\r\n\r\n//    float lumaLevel = luma(col);\r\n//    float alpha = smoothstep( _BrightnessThreshold, _BrightnessThreshold + _SmoothWidth, lumaLevel );\r\n//    vec3 mask = mix(CLEARCOL, col, alpha);\r\n\r\n    gl_FragColor = vec4(col.xyz, 1.0);\r\n\r\n}";
var composeBloom = "precision highp float;\r\n\r\nuniform sampler2D _NarrowBlur;\r\nuniform sampler2D _WideBlur;\r\nuniform sampler2D _Emissive;\r\n\r\nvarying vec2 vUv;\r\n\r\n#define NARROW_GLOW_INTENSITY 1.0\r\n\r\nvec3 screenBlend(vec3 a, vec3 b) {\r\n\r\n    return 1.0 - ((1.0 - a) * (1.0 - b));\r\n\r\n}\r\n\r\nvoid main() {\r\n\r\n    vec3 narrowBloom = texture2D(_NarrowBlur, vUv).xyz * 1.0;\r\n    vec3 wideBloom = texture2D(_WideBlur, vUv).xyz;\r\n    vec3 emissive = texture2D(_Emissive, vUv).xyz * 1.0;\r\n\r\n    vec3 finalBloom = wideBloom+narrowBloom;\r\n\r\n    gl_FragColor = vec4(finalBloom, 1.0);\r\n\r\n}";
var vertex = "precision highp float;\r\n\r\nattribute vec2 position;\r\nattribute vec2 uv;\r\n\r\nvarying vec2 vUv;\r\n\r\nvoid main() {\r\n\r\n    gl_Position = vec4(position, 0.0, 1.0);\r\n\r\n    vUv = uv;\r\n\r\n}";
var kawaseBlur = "precision highp float;\r\n\r\nuniform sampler2D _Color;\r\nuniform vec2 _Resolution;\r\n\r\nuniform float _StepSize;\r\nuniform float _Time;\r\n\r\nuniform float _Seed;\r\n\r\nvarying vec2 vUv;\r\n\r\n\r\nfloat hash12(vec2 p)\r\n{\r\n	vec3 p3  = fract(vec3(p.xyx) * .1031);\r\n    p3 += dot(p3, p3.yzx + 33.33);\r\n    return fract((p3.x + p3.y) * p3.z);\r\n}\r\n\r\nvec3 hash32(vec2 p)\r\n{\r\n	vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));\r\n    p3 += dot(p3, p3.yxz+33.33);\r\n    return fract((p3.xxy+p3.yzz)*p3.zyx);\r\n}\r\n\r\nvoid main() {\r\n    \r\n    vec2 texelSize = 1.0 / _Resolution;\r\n\r\n    vec3 col = texture2D(_Color, vUv + texelSize * _StepSize).xyz;\r\n    col += texture2D(_Color, vUv - texelSize * _StepSize).xyz;\r\n    col += texture2D(_Color, vUv + vec2(texelSize.x, -texelSize.y) * _StepSize).xyz;\r\n    col += texture2D(_Color, vUv + vec2(-texelSize.x, +texelSize.y) * _StepSize).xyz;\r\n    col /= 4.0;\r\n\r\n    vec3 hash1 = hash32(gl_FragCoord.xy+fract(_Time)*1300.0 + _Seed * 150.0);\r\n    vec3 hash2 = hash32(gl_FragCoord.yx+fract(_Time+0.3123)*1300.0 + _Seed * 137.0);\r\n    vec3 dither = ((hash1) + (hash2-1.0)) / 255.0;\r\n\r\n    // Output to screen\r\n    gl_FragColor = vec4(col+dither,1.0);\r\n\r\n}";
var KawaseBlurPass = class {
  constructor(gl, {
    width,
    height
  }) {
    this.gl = gl;
    this.resolutionScale = 0.25;
    this.setSize({ width, height });
    this.initCapturePass();
    this.initProgram();
  }
  setSize({ width, height }) {
    this.width = width === null ? this.gl.canvas.width : width;
    this.height = height === null ? this.gl.canvas.height : height;
  }
  initCapturePass() {
    const uniforms = {
      _Pass: {
        value: new Texture(this.gl)
      },
      _EmissiveMask: {
        value: new Texture(this.gl)
      }
    };
    this.captureProgram = new Mesh(this.gl, {
      geometry: new Triangle(this.gl),
      program: new Program(this.gl, {
        uniforms,
        vertex,
        fragment: capture,
        depthTest: false,
        depthWrite: false,
        cull: null
      })
    });
  }
  initProgram() {
    this.createBlurBuffers();
    const uniforms = {
      _Color: {
        value: new Texture(this.gl)
      },
      _Resolution: {
        value: new Vec2(Math.floor(this.width), Math.floor(this.height))
      },
      _Time: {
        value: 0
      },
      _Seed: {
        value: 0
      },
      _StepSize: {
        value: 0.5
      }
    };
    this.program = new Mesh(this.gl, {
      geometry: new Triangle(this.gl),
      program: new Program(this.gl, {
        uniforms,
        vertex,
        fragment: kawaseBlur,
        depthTest: false,
        depthWrite: false,
        transparent: false,
        cullFace: null
      })
    });
  }
  render({ pass, time }) {
    this.captureProgram.program.uniforms._Pass.value = pass.texture;
    this.gl.renderer.render({ scene: this.captureProgram, target: this.blurBuffers[0].buffer, clear: false });
    for (let i = 0; i < this.blurBuffers.length - 1; i++) {
      this.program.program.uniforms._Color.value = this.blurBuffers[i].buffer.texture;
      this.program.program.uniforms._Resolution.value.copy(this.blurBuffers[i].resolution);
      this.program.program.uniforms._Time.value = time;
      this.program.program.uniforms._Seed.value = i + Math.random() * 1e3;
      this.program.program.uniforms._StepSize.value = 0.5 + i;
      this.gl.renderer.render({ scene: this.program, target: this.blurBuffers[i + 1].buffer, clear: false });
    }
  }
  createBlurBuffers() {
    const bufferCount = 8;
    this.blurBuffers = new Array(bufferCount);
    for (let i = 0; i < this.blurBuffers.length; i++) {
      const textureParams = {
        width: Math.floor(this.width * this.resolutionScale),
        height: Math.floor(this.height * this.resolutionScale),
        minFilter: this.gl.LINEAR,
        magFilter: this.gl.LINEAR,
        format: this.gl.RGB,
        internalFormat: this.gl.RGB,
        depth: false
      };
      this.blurBuffers[i] = {
        buffer: new RenderTarget(this.gl, textureParams),
        resolution: new Vec2(textureParams.width, textureParams.height)
      };
    }
  }
  onResize({ width, height }) {
  }
  get Output() {
    return this.blurBuffers[this.blurBuffers.length - 1].buffer.texture;
  }
};
var BloomPass = class {
  constructor(gl) {
    this.gl = gl;
    this.resolutionScale = 0.5;
    this.setSize({
      width: this.gl.canvas.width,
      height: this.gl.canvas.height
    });
    this.initCapturePass();
    this.initLumaMaskPass();
    this.initBlurPasses();
    this.initCompositePass();
  }
  initCapturePass() {
    const uniforms = {
      _Pass: {
        value: new Texture(this.gl)
      }
    };
    this.captureProgram = new Mesh(this.gl, {
      geometry: new Triangle(this.gl),
      program: new Program(this.gl, {
        uniforms,
        vertex: vertex$2,
        fragment: capture,
        depthTest: false,
        depthWrite: false,
        cull: null
      })
    });
    this.captureTarget = this.createCaptureTarget();
  }
  createCaptureTarget() {
    return new RenderTarget(this.gl, {
      width: Math.floor(this.width * this.resolutionScale),
      height: Math.floor(this.height * this.resolutionScale)
    });
  }
  initLumaMaskPass() {
    const uniforms = {
      _ColorPass: {
        value: this.captureTarget.texture
      },
      _BrightnessThreshold: {
        value: 0.2
      },
      _SmoothWidth: {
        value: 0.2
      }
    };
    this.lumaMaskProgram = new Mesh(this.gl, {
      geometry: new Triangle(this.gl),
      program: new Program(this.gl, {
        uniforms,
        vertex: vertex$2,
        fragment: lumaMask,
        depthTest: false,
        depthWrite: false,
        cull: null
      })
    });
    this.lumaMaskPassTarget = new RenderTarget(this.gl, {
      width: Math.floor(this.width * this.resolutionScale),
      height: Math.floor(this.height * this.resolutionScale)
    });
  }
  initBlurPasses() {
    this.wideBlur = new KawaseBlurPass(this.gl, { width: this.gl.canvas.width, height: this.gl.canvas.height });
    this.blurPass = new DualFilterBlurPass(this.gl, { width: this.gl.canvas.width, height: this.gl.canvas.height });
  }
  initCompositePass() {
    const uniforms = {
      _NarrowBlur: {
        value: this.blurPass.Output
      },
      _WideBlur: {
        value: this.wideBlur.Output
      },
      _Emissive: {
        value: this.lumaMaskPassTarget.texture
      }
    };
    this.bloomCompositeProgram = new Mesh(this.gl, {
      geometry: new Triangle(this.gl),
      program: new Program(this.gl, {
        uniforms,
        vertex: vertex$2,
        fragment: composeBloom,
        depthTest: false,
        depthWrite: false,
        transparent: false,
        cullFace: null
      })
    });
    this.bloomTarget = new RenderTarget(this.gl, { width: Math.floor(this.width * this.resolutionScale), height: Math.floor(this.height * this.resolutionScale) });
  }
  render({ pass, time }) {
    this.captureProgram.program.uniforms._Pass.value = pass;
    this.gl.renderer.render({ scene: this.captureProgram, target: this.captureTarget, clear: false });
    this.wideBlur.render({ pass: this.captureTarget, time });
    this.lumaMaskProgram.program.uniforms._ColorPass.value = this.captureTarget.texture;
    this.gl.renderer.render({ scene: this.lumaMaskProgram, target: this.lumaMaskPassTarget, clear: false });
    this.blurPass.render({ pass: this.lumaMaskPassTarget, time });
    this.bloomCompositeProgram.program.uniforms._NarrowBlur.value = this.blurPass.Output;
    this.bloomCompositeProgram.program.uniforms._WideBlur.value = this.wideBlur.Output;
    this.bloomCompositeProgram.program.uniforms._Emissive.value = this.lumaMaskPassTarget.texture;
    this.gl.renderer.render({ scene: this.bloomCompositeProgram, target: this.bloomTarget, clear: false });
  }
  setSize({ width, height }) {
    this.width = width === null ? this.gl.canvas.width : width;
    this.height = height === null ? this.gl.canvas.height : height;
  }
  onResize({ width, height }) {
    this.captureTarget = this.createCaptureTarget();
  }
  get Output() {
    return this.bloomTarget.texture;
  }
};
var PostProcessing = class extends Mesh {
  constructor(gl) {
    super(gl);
    this.gl = gl;
    this.passes = [];
    this.createSceneCaptureTarget();
    this.initFXAAPass();
    this.initBloomPass();
    this.initFinalPass();
  }
  createSceneCaptureTarget() {
    const params = {
      minFilter: this.gl.LINEAR,
      magFilter: this.gl.LINEAR,
      wrapS: this.gl.CLAMP_TO_EDGE,
      wrapT: this.gl.CLAMP_TO_EDGE
    };
    this.sceneCaptureTarget = new RenderTarget(this.gl, params);
  }
  initFXAAPass() {
    this.fxaa = new FxaaPass(this.gl);
    this.passes.push(this.fxaa);
  }
  initBloomPass() {
    this.bloomPass = new BloomPass(this.gl);
  }
  initFinalPass() {
    const uniforms = {
      _FxaaPassOutput: {
        value: this.fxaa.Output
      },
      _BlooomPassOutput: {
        value: this.bloomPass.Output
      },
      _Time: {
        value: 0
      }
    };
    this.finalPass = new Mesh(this.gl, {
      geometry: new Triangle(this.gl),
      program: new Program(this.gl, {
        uniforms,
        vertex: vertex$1,
        fragment,
        depthTest: false,
        depthWrite: false,
        transparent: false,
        cullFace: null
      })
    });
  }
  render({ scene, camera, time }) {
    if (camera) {
      this.gl.renderer.render({ scene, camera, target: this.sceneCaptureTarget, clear: true });
    } else {
      this.gl.renderer.render({ scene, target: this.sceneCaptureTarget, clear: true });
    }
    this.fxaa.render({ pass: this.sceneCaptureTarget.texture });
    this.bloomPass.render({ pass: this.fxaa.Output, time });
    this.finalPass.program.uniforms._Time.value = time;
    this.gl.renderer.render({ scene: this.finalPass, clear: false });
  }
  onResize({ width, height }) {
    this.createSceneCaptureTarget();
    this.fxaa.onResize();
    this.blurPass.onResize({ width: this.gl.canvas.width, height: this.gl.canvas.height });
  }
};
var bloom$1 = class {
  constructor({ el }) {
    this.init({ el });
  }
  init({ el }) {
    this.renderer = new Renderer({
      canvas: el,
      width: el.clientWidth,
      height: el.clientHeight,
      antialias: false,
      dpr: 1
    });
    this.gl = this.renderer.gl;
    const bg = 0.8;
    this.gl.clearColor(bg, bg, bg + 0.1, 0);
    const {
      clientWidth,
      clientHeight
    } = this.gl.canvas;
    this.wk = 1 / clientWidth;
    this.hK = 1 / clientHeight;
    this.camera = new Camera(this.gl, {
      aspect: clientWidth / clientHeight
    });
    this.camera.position.x = 0;
    this.camera.position.y = 0;
    this.camera.position.z = 10;
    this.controls = new Orbit(this.camera, {
      target: new Vec3(0, 0, 0)
    });
    this.renderToScreen = false;
    this.scene = new Transform();
    this.sphere = new SphereMesh(this.gl);
    this.sphere.setParent(this.scene);
    this.initPostPass();
  }
  initPostPass() {
    this.post = new PostProcessing(this.gl);
  }
  render({
    scene,
    camera = null,
    target = null,
    clear,
    time = 0
  }) {
    if (!this.renderToScreen) {
      this.post.render({ scene, camera, time });
    } else {
      this.renderer.render({
        scene,
        camera,
        clear
      });
    }
  }
  update({
    time,
    deltaTime
  }) {
    this.controls.update();
    this.render({
      scene: this.scene,
      camera: this.camera,
      clear: true,
      time: time * 1e-3
    });
  }
  onResize(width, height) {
    if (width && height) {
      this.renderer.setSize(width, height);
      const {
        clientWidth,
        clientHeight
      } = this.gl.canvas;
      this.wk = 1 / clientWidth;
      this.hK = 1 / clientHeight;
      this.camera.perspective({
        aspect: clientWidth / clientHeight
      });
    }
  }
};
var css = {
  code: ".sketch.svelte-q6ubty{position:absolute;min-width:100vw;min-height:100vh;overflow:hidden}.webgl-canvas.svelte-q6ubty{position:fixed;width:100%;height:100%;top:0;left:0;margin:0;border:0px}",
  map: `{"version":3,"file":"bloom.svelte","sources":["bloom.svelte"],"sourcesContent":["<script>\\r\\n    \\r\\n    import { onMount, tick } from 'svelte';\\r\\n    import {bloom} from '$lib/sketches/bloom/bloom.js';\\r\\n    \\r\\n    //--------------------------------\\r\\n            \\r\\n    let el;\\r\\n    let canvas;\\r\\n    let sketch;\\r\\n\\r\\n    let containerWidth = 2;\\r\\n    let containerHeight = 2;\\r\\n\\r\\n    let time = 0;\\r\\n    let deltaTime = 0;\\r\\n    let prevTime = 0;\\r\\n    \\r\\n    //--------------------------------\\r\\n    \\r\\n    onMount(async()=> {\\r\\n        \\r\\n        await tick();\\r\\n\\r\\n        sketch = new bloom({el: canvas});\\r\\n\\r\\n        handleTick();\\r\\n            \\r\\n    });\\r\\n\\r\\n    const updateClock = () => {\\r\\n\\r\\n        time = performance.now();\\r\\n        deltaTime = (time - prevTime) * 0.001;\\r\\n        prevTime = time;\\r\\n\\r\\n    }\\r\\n\\r\\n    const handleTick = () => {\\r\\n        window.requestAnimationFrame(() => handleTick());\\r\\n        updateClock();\\r\\n        sketch.update({time, deltaTime});\\r\\n\\r\\n    }\\r\\n\\r\\n    const handleResize = () => {\\r\\n        sketch.onresize({width: containerWidth, height: containerHeight})\\r\\n    }\\r\\n    \\r\\n<\/script>\\r\\n\\r\\n<svelte:window on:resize={handleResize} />\\r\\n    \\r\\n<main class=sketch bind:this={el} bind:clientWidth={containerWidth} bind:clientHeight={containerHeight}>\\r\\n    <canvas class=webgl-canvas bind:this={canvas}></canvas>\\r\\n</main>\\r\\n    \\r\\n<style lang=scss>.sketch {\\n  position: absolute;\\n  min-width: 100vw;\\n  min-height: 100vh;\\n  overflow: hidden;\\n}\\n\\n.webgl-canvas {\\n  position: fixed;\\n  width: 100%;\\n  height: 100%;\\n  top: 0;\\n  left: 0;\\n  margin: 0;\\n  border: 0px;\\n}</style>\\r\\n"],"names":[],"mappings":"AAyDiB,OAAO,cAAC,CAAC,AACxB,QAAQ,CAAE,QAAQ,CAClB,SAAS,CAAE,KAAK,CAChB,UAAU,CAAE,KAAK,CACjB,QAAQ,CAAE,MAAM,AAClB,CAAC,AAED,aAAa,cAAC,CAAC,AACb,QAAQ,CAAE,KAAK,CACf,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,GAAG,CAAE,CAAC,CACN,IAAI,CAAE,CAAC,CACP,MAAM,CAAE,CAAC,CACT,MAAM,CAAE,GAAG,AACb,CAAC"}`
};
var Bloom = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let el;
  let canvas;
  let sketch;
  let time = 0;
  let deltaTime = 0;
  let prevTime = 0;
  onMount(async () => {
    await tick();
    sketch = new bloom$1({ el: canvas });
    handleTick();
  });
  const updateClock = () => {
    time = performance.now();
    deltaTime = (time - prevTime) * 1e-3;
    prevTime = time;
  };
  const handleTick = () => {
    window.requestAnimationFrame(() => handleTick());
    updateClock();
    sketch.update({ time, deltaTime });
  };
  $$result.css.add(css);
  return `
    
<main class="${"sketch svelte-q6ubty"}"${add_attribute("this", el, 1)}><canvas class="${"webgl-canvas svelte-q6ubty"}"${add_attribute("this", canvas, 1)}></canvas>
</main>`;
});
var bloom = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Bloom
});

// .svelte-kit/netlify/entry.js
async function handler(event) {
  const { path, httpMethod, headers, rawQuery, body, isBase64Encoded } = event;
  const query = new URLSearchParams(rawQuery);
  const rawBody = headers["content-type"] === "application/octet-stream" ? new TextEncoder("base64").encode(body) : isBase64Encoded ? Buffer.from(body, "base64").toString() : body;
  const rendered = await render({
    method: httpMethod,
    headers,
    path,
    query,
    rawBody
  });
  if (rendered) {
    return {
      isBase64Encoded: false,
      statusCode: rendered.status,
      headers: rendered.headers,
      body: rendered.body
    };
  }
  return {
    statusCode: 404,
    body: "Not found"
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
