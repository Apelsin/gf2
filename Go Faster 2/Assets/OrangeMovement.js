
var torqueMultiplier = 120;
var forceMultiplier = 400;
var velocityDamping = -1;

var speed = 800;
var eulerAngleVelocity : Vector3 = Vector3 (0, 100, 0);


function Start() {
rigidbody.maxAngularVelocity = 5;
//rigidbody.centerOfMass = Vector3 (0, -7, 0);
//var horizontalForce = 20;
}

function Update () {
}

function FixedUpdate () {

        //I need to somehow add drag that doesn't affect gravity.
    rigidbody.AddRelativeForce (velocityDamping * rigidbody.velocity.x, -10, velocityDamping * rigidbody.velocity.z);
    
    rigidbody.AddRelativeForce (Vector3.forward * Input.GetAxis("Vertical") * forceMultiplier);
    //rigidbody.AddRelativeForce (Vector3.right * Input.GetAxis("Horizontal") * horizontalForce);
    
    //rigidbody.AddRelativeTorque (Vector3.up * Input.GetAxis("Horizontal") * torqueMultiplier);
    //rigidbody.AddRelativeTorque (Vector3.up * Input.GetAxis("Mouse X") * torqueMultiplier);
    
    var deltaRotation : Quaternion = Quaternion.Euler(eulerAngleVelocity * Time.deltaTime * Input.GetAxis("Horizontal"));
    rigidbody.MoveRotation(rigidbody.rotation * deltaRotation);
    

}