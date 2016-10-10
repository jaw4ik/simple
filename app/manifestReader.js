define(['jsonReader'], function (jsonReader) {
    var manifestData = null;

    function readManifest() {
        var defer = Q.defer();
        if (!manifestData) {
            jsonReader.read('manifest.json').then(function(data) {
                manifestData = data;
                defer.resolve(manifestData);
            });
        } else {
            defer.resolve(manifestData);
        }
        return defer.promise;
    }

    return {
        readManifest: readManifest,
    };

});