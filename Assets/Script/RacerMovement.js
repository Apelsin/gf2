#pragma strict
var forceMultiplier: float = 100;
var horizontalDrag: float = 0.5;
var verticalDrag: float = 0.01;

var eulerAngleVelocity: Vector3 = Vector3(0, 70, 0);

var minVelOrient: float = 0.5;
var dampingRate: float = 5.0;
var rayLength: float = 10000.0;
var turnComp: float = 10000.0;
var realignmentDistance: float = 0.5;
var PullDownMultiplier: float = 5;
var Splay:float = 0.05;
var WingSeparation:float = 1;
//private var mask : int;
private var currentUp = Vector3.up;
private var lastRotation: Quaternion;

private var hz:float;
private var vt:float;

function Update() {}

function FixedUpdate() {
    UpdateMovement();
}

function OnDrawGizmos()
{
    var rays = DoRays();
    for(var g in rays)
    {
        if(g.Value instanceof Ray)
        {
            var r : Ray = g.Value;
            Gizmos.DrawLine(r.origin, r.origin + r.direction * 100);
        }
    }
}

function DoRays()
{
    var p_trans = transform.parent.transform;
    var p_rbody = p_trans.rigidbody;
    
    var rays = {};
    
    // Current upward direction
    var currentUp = p_trans.up;
    
    // Start positions for the hit tests
    var nose =       p_trans.forward * collider.bounds.size.z / 2.0;
    var wingL = -3 * p_trans.forward - WingSeparation * p_trans.right * collider.bounds.size.x / 2.0;
    var wingR = -3 * p_trans.forward + WingSeparation * p_trans.right * collider.bounds.size.z / 2.0;
    
    // Hit tests
    var ray_nose  = Ray(p_trans.position + nose,  -currentUp + (Splay * nose));
    var ray_wingL = Ray(p_trans.position + wingL, -currentUp + (Splay * wingL));
    var ray_wingR = Ray(p_trans.position + wingR, -currentUp + (Splay * wingR));
    
    rays.Add("Nose", ray_nose);
    rays.Add("Wing (Left)", ray_wingL);
    rays.Add("Wing (Right)", ray_wingR);
    
    return rays;
}

function UpdateMovement() {
    var p_trans = transform.parent.transform;
    var p_rbody = p_trans.rigidbody;
    
    // Control input smoothed out
    // HUGE hack
    hz = FunStuff.IOSmooth(hz, Input.GetAxis("Horizontal"), 4);
    //vt = IOSmooth(vt, Input.GetAxis("Vertical"));
    
    var e_velo : Vector3 = eulerAngleVelocity * Time.deltaTime * Input.GetAxis("Horizontal");
    var e_velo_smooth : Vector3 = eulerAngleVelocity * Time.deltaTime * hz;
    var deltaRotationRB: Quaternion = Quaternion.Euler(Vector3(0, e_velo.y, 0));
    var deltaRotationRacer: Quaternion = Quaternion.Euler(Vector3(e_velo_smooth.x * 50, 0, e_velo_smooth.z * 50));
    p_rbody.rotation *= deltaRotationRB;
    transform.rotation = transform.parent.rotation * deltaRotationRacer;
    
    // This assumes a and b are unit vectors
    var deltaRotationRBDeflection: float = 1.0 - Mathf.Pow(Vector3.Dot(deltaRotationRB * Vector3.fwd, Vector3.fwd), turnComp);

    // Three hit tests to make a normal plane
    var hitA: RaycastHit;
    var hitAalt: RaycastHit;
    var hitB: RaycastHit;
    var hitC: RaycastHit;
    
    // This is so bad, I should end myself, oh my God
    var stuff = DoRays();
    var ray_nose : Ray = stuff["Nose"];           // /wrists
    var ray_wingL : Ray = stuff["Wing (Left)"];   // /wrists
    var ray_wingR : Ray = stuff["Wing (Right)"];  // /wrists
    
    
    // Revisit these layer bitflags when it's actually known what the heck they're going to be for:
    Physics.Raycast(ray_nose, hitA, rayLength, 0xFFFFFFFF);
    Physics.Raycast(ray_wingL, hitB, rayLength, 0xFFFFFFFF);
    Physics.Raycast(ray_wingR, hitC, rayLength, 0xFFFFFFFF);
    
    var nose_normal_variance = Vector3.Dot(hitA.normal, ray_nose.direction);
    
    // Get the normal vector of the plane formed by these three hit tests:
    var ab:Vector3 = hitB.point - hitA.point; 
    var ac:Vector3 = hitC.point - hitA.point;
    var p_normal:Vector3 = Vector3.Cross(ac, ab);  
    var abc_mid = (hitA.point + hitB.point + hitC.point) / 3.0;
    var p_fwd_pseudo_binormal = hitA.point - abc_mid; 
    
    // Quaternion rotation based on average of wingtip hit tests pointing toward nose hit test
    var targetRotation = Quaternion.LookRotation(p_fwd_pseudo_binormal, p_normal);
    lastRotation = targetRotation;

    // Distance between bottom of the vehicle and the ground
    var pulldown = collider.bounds.size.y / 2.0 - hitA.distance;

    // Smoothly conform to the ground normals
    p_rbody.rotation = Quaternion.Slerp(
        p_rbody.rotation, targetRotation,
        Time.deltaTime * dampingRate * (1.0 - nose_normal_variance));

    // Remove roll (and pitch, currently) from rotation based on distance from ground hit
    p_rbody.rotation = Quaternion.Slerp(
        p_rbody.rotation,
        Quaternion.Euler(0.0, p_rbody.rotation.eulerAngles.y, 0.0),
        0.05 * (1.0 - FunStuff.G2Curve(pulldown / realignmentDistance)) * dampingRate);


    //This applies force for forward/backward motion.
    p_rbody.AddRelativeForce(Vector3.forward * Input.GetAxis("Vertical") * forceMultiplier);
    
    //This gets the local velocity vector and stores it for a bit so it isn't looked up like, a billion times.
    var localVelocity: Vector3 = p_trans.InverseTransformDirection(p_rbody.velocity);
    
    //Drag for all horizontal movement, proportional to velocity. It's also where vertical drag can be added.
    //Technically the drag on an object through a fluid should be proportional to v^2, but eh, it's a game.
    p_rbody.AddRelativeForce(horizontalDrag * -localVelocity.x, verticalDrag * -localVelocity.y, horizontalDrag * -localVelocity.z);

    //Rotate the vehicle
    p_rbody.MoveRotation(p_rbody.rotation * deltaRotationRB);
    
    //Deflect based on turning
    p_rbody.AddRelativeForce(-Vector3(localVelocity.x, 0.0, 0.0) * deltaRotationRBDeflection, ForceMode.Acceleration);

    p_rbody.AddRelativeForce(Vector3(0.0, pulldown * PullDownMultiplier, 0.0), ForceMode.Acceleration);
    
    Debug.Log(pulldown);
    
    if(audio != null)
    {
        audio.pitch = 2.0 + Mathf.Abs(localVelocity.z) / 200;
    }
}