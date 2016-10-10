define(['../guard', './object'],
    function (guard, object) {

        var actor = function (spec) {

            if (typeof spec == typeof undefined) {
                throw 'You should provide a specification to create an Actor';
            }

            spec.objectType = 'Agent';
            var obj = new object(spec);
            
            if(spec.account) {
                guard.throwIfNotString(spec.account.homePage, 'You should provide homePage for Actor account');
                guard.throwIfNotString(spec.account.name, 'You should provide name for Actor account');
                obj.account = {
                    homePage: spec.account.homePage,
                    name: spec.account.name
                };
            } else {
                guard.throwIfNotMbox(spec.mbox, 'You should provide mbox identity for Actor');
                obj.mbox = spec.mbox;
            }
            obj.name = spec.name;

            return obj;
        };

        return actor;
    }
);