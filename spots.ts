
const spots = [
    "cam=-1.770057,0.04141,0.000134&vals=2,mdb_val:0|0,mdb_offset:2,mdb_iterations:60&colors=112735,ff0006,ffe23e,0.95",
    "cam=-1.730958,0.040592,0.000646&vals=2,mdb_val:0|0,mdb_offset:1.933,mdb_iterations:79&colors=000000,effdea,000000,0.95",
    "cam=-1.118157,0.026371,0.000178&vals=0,mdb_val:0|0.245,mdb_offset:3.041,mdb_iterations:400&colors=000000,effdea,000000,1.095",
    "cam=-0.045922,0.66176,0.000729&vals=0,mdb_val:0|0.245,mdb_offset:3.041,mdb_iterations:400&colors=000000,4152ed,ec8888,0.95",
    "cam=-0.063526,0.671127,0.00115&vals=0,mdb_val:0|0.245,mdb_offset:3.041,mdb_iterations:400&colors=092305,145b70,c9e95c,0.95",
    "cam=-0.132351,0.749804,0.00015&vals=0,mdb_val:0|0.245,mdb_offset:3.041,mdb_iterations:400&colors=05020f,840003,eabf5b,0.95",
    "cam=-0.130831,0.749253,0.000131&vals=0,mdb_val:0|0.245,mdb_offset:3.041,mdb_iterations:223&colors=e7df54,964910,000000,0.95",
    "cam=-1.447945,0.001315,0.000197&vals=0,mdb_val:0|0,mdb_offset:-1.819,mdb_iterations:223&colors=e72e8e,000000,000000,0.95",
    "cam=0.427274,0.658581,0.003236&vals=0,mdb_val:0|0,mdb_offset:-1.76,mdb_iterations:348&colors=7bc11c,f15a27,480002,0.95",
    "cam=0.08542,-0.004975,0.068621&vals=1,mdb_val:0.167|0.59,mdb_offset:1.864,mdb_iterations:300&colors=c1a91c,f0470f,123618,0.95",
    "cam=-0.007981,-0.109045,0.031923&vals=1,mdb_val:0.167|-0.413,mdb_offset:3.969,mdb_iterations:300&colors=000000,0c9a21,53a9b0,0.95",
    "cam=-0.019403,-0.436259,0.011921&vals=1,mdb_val:0.167|-0.469,mdb_offset:3.407,mdb_iterations:250&colors=000000,0c9a21,53a9b0,0.95",
    "cam=-0.066178,-0.126638,0.007987&vals=1,mdb_val:0.078|0.147,mdb_offset:14.321,mdb_iterations:326&colors=000000,961064,e0ba23,0.95",
    "cam=-0.025945,-0.083062,0.007708&vals=1,mdb_val:0.078|0.456,mdb_offset:4.065,mdb_iterations:326&colors=000000,961064,e0ba23,0.95",
    "cam=0.002727,0.001614,0.059491&vals=1,mdb_val:0.081|0.475,mdb_offset:4.031,mdb_iterations:326&colors=ffffff,3427cd,11c4ff,0.95",
    "cam=-0.059101,0.381229,0.000115&vals=1,mdb_val:0.081|0.475,mdb_offset:3.916,mdb_iterations:326&colors=510d0f,a2840f,f1c587,0.95",
    "cam=0.001838,0.023303,0.050405&vals=3,mdb_val:0|0,mdb_offset:2,mdb_delta:0.514,mdb_iterations:300&colors=0c1152,d997f4,ebc0a0,0.95",
    "cam=0.264453,0.002708,0.00014&vals=0,mdb_val:0|0,mdb_offset:2,mdb_iterations:200&colors=0c1152,98f3af,ebc0a0,0.95",
    "cam=-0.350193,0.632604,0.000267&vals=0,mdb_val:0|0,mdb_offset:2,mdb_iterations:300&colors=ffffff,d9952f,ea3535,0.976",
    "cam=0.310214,0.02728,0.000015&vals=0,mdb_val:0|0,mdb_offset:2,mdb_iterations:320&colors=112735,a22d85,e98243,0.95",
    "cam=-0.098531,-0.128182,0.166385&vals=1,mdb_val:-0.642|0.585,mdb_offset:1.519,mdb_iterations:300&colors=0f1624,22979d,68ae75,0.95",
    "cam=-0.377784,-0.357893,0.316745&vals=1,mdb_val:-0.618|-0.761,mdb_offset:1.076,mdb_iterations:300&colors=6f0000,ff1a1f,e1c197,0.976",
    "cam=-0.628727,0.435146,0.010693&vals=1,mdb_val:0.091|0.43,mdb_offset:4,mdb_iterations:326&colors=000000,961064,e0ba23,0.95",
    "cam=-0.033442,0.575151,0.000407&vals=0,mdb_val:0|0.245,mdb_offset:3.041,mdb_iterations:400&colors=241104,145b70,58ed6f,0.95",
    "cam=-0.493265,-0.160558,0.001331&vals=2,mdb_val:-0.764|-0.229,mdb_offset:2,mdb_iterations:150&colors=15510d,9cefc6,e4ee9d,0.95",
    "cam=-1.748459,0.003046,0.000531&vals=2,mdb_val:0|-0.255,mdb_offset:2.095,mdb_iterations:150&colors=15510d,efd79c,fb9b9d,0.95",
];

function RandomSpot() {
    let randomSpot = spots[Math.floor(Math.random() * spots.length)];
    LoadPropsFromURL(randomSpot);
    propsChangedSinceLastFrame = true;
}
