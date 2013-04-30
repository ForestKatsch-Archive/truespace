
var prop={};

function prop_init() {
    prop.about={};
    prop.about.version=VERSION;
    prop.about.debug=true;
    prop.ships={};
    prop.ships.active_ship=-1;
    prop.assets={};
    loaded("prop");
}
