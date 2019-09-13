var WIDTH = 800;
var HEIGHT = 550;
var ROWS = HEIGHT/10;
var ROW_HEIGHT = HEIGHT/ROWS;
var COLS = WIDTH/10;
var COL_WIDTH = WIDTH/COLS;
var scene;
var graphics;

const BRIGHT_GREEN = 0x00ff00;
const BRIGHT_PINK = 0Xff0080;
const BALL_SIZE = 10;
const SQUARE_SIZE = 20;
const draw_grid = true;


var config = {
    type: Phaser.AUTO,
    width: WIDTH,
    height: HEIGHT,
  //  backgroundColor: '#efefef',
    physics: {
        default: 'matter',
        matter: {
            enableSleeping: true
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);
var map = [];

function preload ()
{
    this.load.image('blue', 'assets/images/blue.png');
}

function create ()
{
    //set the scene to a var so I can access it in helper functions
    scene = this;
   // this.water = this.add.group();
    this.water_collision_cat = this.matter.world.nextCategory();
    
    this.water_blocks = [];
    for (var col = 0; col<COLS; col++){
        this.water_blocks.push([]);
        for (var row = 0; row<ROWS; row++){
            this.water_blocks[col].push(0);
        }
    }
    console.log(this.water_blocks);
    draw_graphics(this);
    map_create();
    create_walls();
    map_render_walls();
    //console.log(map);


    //make things bounce off the walls
    this.matter.world.setBounds();

   // drop_new_ball();
   
  //  var button_balls;


    this.matter.world.on('sleepstart', function (event, body) {
        var water_drop = event.source.gameObject;
    //    water_drop.setTint(0xff0000);
        // this centers the coords in the square the ball sleeps in
        var sqr_coord = get_square_coords(water_drop.x, water_drop.y);
        var pixel_coords = get_pixel_coords(sqr_coord[0],sqr_coord[1]);
     //   console.log("coords: ",pixel_coords);
        var water_block = scene.matter.add.image(pixel_coords[0], pixel_coords[1],"water_square_image").setStatic(true);
        //save the block in an 2d array so it can be moved later
        scene.water_blocks[sqr_coord[0]][sqr_coord[1]]= water_block;
        //console.log("sprite added to group at coord: ", sqr_coord);
        water_block.setCollisionCategory(scene.water_collision_cat);
        map_add_square("water",sqr_coord);
          //     event.source.gameObject.setStatic(true);
        water_drop.destroy();
    });

    this.matter.world.on('sleepend', function (event) {
 //       event.source.gameObject.setTint(0xffffff);
    });

    //this.wall_group = this.add.group();


    
    // adds a button using the small_button_image generated in draw_graphics
    var button_print = this.matter.add.image((WIDTH/4)*3, 50, 'small_button_image').setStatic(true);
    button_print.setCollidesWith();
    var text = scene.add.text(button_print.x, button_print.y, "print", { font: '22px Arial', fill: '#00ff00' });
    text.setOrigin(0.5,0.5);
    button_print.setInteractive();
    button_print.on('pointerdown', ()=>{map_print()});


    var button_water_row = this.matter.add.image((WIDTH/4)*3, 150, 'small_button_image').setStatic(true);
    button_water_row.setCollidesWith();
    var text = scene.add.text(button_water_row.x, button_water_row.y, "water_row", { font: '22px Arial', fill: '#00ff00' });
    text.setOrigin(0.5,0.5);
    button_water_row.setInteractive();
    button_water_row.on('pointerdown', ()=>{map_water_flow_across()});
   // var wall_line  = this.matter.add.image(75, HEIGHT-50, 'water_line_image').setStatic(true);
   // var wall_1  = this.matter.add.image(150, 270, 'wall_image').setStatic(true);
  //  wall_1.setCollisionCategory(this.cat1);

    // an event that stops the water rising if it is
    this.time.addEvent({ delay:10, callback: new_ball, callbackScope: this, loop: true });
    
    this.time.addEvent({delay: 100, callback: map_flow_water_down, callbackScope: this, loop: true});
    this.time.addEvent({delay: 450, callback: map_calculate_pressure, callbackScope: this, loop: true});
   // this.time.addEvent({delay: 4500, callback: map_water_flow_across, callbackScope: this, loop: false});
    // var timer = scene.time.addEvent({
    //     delay: 500,                // ms
    //     callback: test_timer(),
    //     callbackScope: this,
    //     loop: true
    // });
}

function update(){

}


function test_timer(){
   // console.log("test")
}


function draw_graphics(game){
  graphics = game.make.graphics({x:0, y:0, add: false});

  // draw a white ball to tint later
  graphics.fillStyle(0xffffff);
  graphics.fillCircle(BALL_SIZE/2,BALL_SIZE/2,BALL_SIZE/2)
  graphics.generateTexture('ball_image', BALL_SIZE, BALL_SIZE);
  graphics.clear();
  
  // draw a small display panel graphics
  graphics.fillStyle(0xffffff);
  graphics.fillRect(0,0,140,60);
  graphics.lineStyle(14,BRIGHT_PINK,1)
  graphics.strokeRect(0,0,140,60);
  graphics.generateTexture('small_button_image', 140,60);
  graphics.clear();
  
    // draw a square
  graphics.fillStyle(0xffffff);
  graphics.fillRect(0,0,20,20);
  graphics.generateTexture('square_image', 20,20);
  graphics.clear();
  
    // draw a wall panel
  graphics.fillStyle(0x694b14);
  graphics.fillRect(0,0,100,300);
//  graphics.lineStyle(14,BRIGHT_PINK,1)
 // graphics.strokeRect(0,0,140,60);
  graphics.generateTexture('wall_image', 100,300);
  graphics.clear();
  
      // draw a water square
  graphics.fillStyle(0x0349fc);
  graphics.fillRect(0,0,10,10);
  graphics.generateTexture('water_square_image', 10,10);
  graphics.clear();
  
  if (draw_grid == true){
//    graphics.lineStyle(14,BRIGHT_PINK,1);
   // console.log("draw grid")
    var background_graphics = scene.add.graphics();
    background_graphics.lineStyle(.5, 0x00ff00, 1);
   
    for (var col = 0; col <COLS; col++){
        background_graphics.lineBetween(col*COL_WIDTH, 0, col*COL_WIDTH, HEIGHT);
    }
    
    for (var row=0; row <ROWS; row++){
        background_graphics.lineBetween(0,row*ROW_HEIGHT,WIDTH,row*ROW_HEIGHT);
    }
  }
}

function map_create(){
    for (var col = 0; col <COLS; col++){
        map.push([]);
        for (var row=0; row <ROWS; row++){
            map[col].push(0);
                        
        }
    }
}

function map_add_square(type, coords){
    if (type == "water"){
     //   console.log("map add water at: ", coords)
        map[coords[0]][coords[1]] = 1;
    }
    
}

function create_walls(){

    for (var r =5; r < 36; r++){
        map[2][r]=-1;
    }

    for (var r =5; r < 36; r++){
        map[4][r]=-1;
    }
    
    for (var r =5; r < 36; r++){
        map[55][r]=-1;
    }
    for (var r =5; r < 36; r++){
        map[57][r]=-1;
    }
    for (var c=4; c<55; c++){
        map[c][35]=-1;
    }
    for (var c=4; c<55; c++){
        map[c][37]=-1;
    }   

    for (var c=0; c<80; c++){
        map[c][50]=-1;
    }   
}

function map_render_walls(){
    for (var col=0; col < COLS; col++){
        for(var row=0; row<ROWS; row++){
            if (map[col][row]==-1){
                var square_coords
                var p_coords = get_pixel_coords(col, row);
               // console.log(p_coords)
                var square = scene.matter.add.image(p_coords[0]-COL_WIDTH/2, p_coords[1]- ROW_HEIGHT/2,'square_image').setStatic(true);
                square.setCollisionCategory(scene.water_collision_cat);
            }
        }
    }
}


function map_print(){
    var map_section =[];
    for (var col=0 ; col<30; col++){
        map_section.push([]);
        for (var row=0; row<30; row ++){
            map_section[col][row]= map[row][col]
        }
    }
    console.log(map_section);
}

function map_calculate_pressure(){

    for (var col=0; col < COLS; col++){
        var water_column = [];
        for (var row = 0; row <ROWS; row ++){
            var water_found = false;
            if(map[col][row]>0){
              //  console.log("water found")
                water_found = true;
            }
            // if water_found start new while loop
            var pressure = 1;
            if(water_found){
                var is_water = true;
                while (is_water){
                  //  console.log("water pressure: ", pressure);
                  //  console.log("at coord: ", col, row);
                    map[col][row] = pressure;
                    pressure ++;
                    row ++;
                    if (map[col][row]<1){
                        is_water = false;
                        // reset row so it starts at the bottom of the water column
                        row = row-1;
                    }
                    
                }
            }
            
        }
        // check from the top of the column down if there is water
            // if water found then store in water_column array and->
            // start new loop to check while water found
                //keep checking for water and add to water_column array
                    // get total pressure from length of array
        
            // check if there is water of any pressure at
        
    }
}

function map_flow_water_down(){
    console.log("flow water down")
    //this function applies pressure downwards in each column
    for (var col = 0; col<COLS; col ++){
        // go from the bottom of the col 
        for (var row = ROWS; row > 0; row--){
            // if water at coord
            if (map[col][row]>0){
                // and if no water or ground below coord then drop
                if(map[col][row+1]==0){

                    // move water_block from origin down one square
                    
                    move_water_block([col,row]);
                    //  move_water_block([0,0]);
                    //remove the water from the map
                    map[col][row]=0;
                
                    //place it in the row below
                    map[col][row+1]=1;    
                }                
            }
            // and drop water down to available space
        }
    }
}

function map_water_flow_across(){
    // find the stretch of water
    
    //get the row
    for (var row = ROWS; row>0; row--){
        // an array to store the water state of each col in this row
        var row_array = [];
        for(var col = 0; col<COLS; col++){
            row_array.push(map[col][row])
        }

       var new_ball_array = get_new_water_balls(row_array);
       if (new_ball_array.length>0){
        console.log("====================================")
        console.log("row: ", row);
        console.log("new ball array: ", new_ball_array);
        console.log("=====================================")
        
            //for each coord in new_ball_array
        for (var i =0; i<new_ball_array.length; i++){
            //        // create a new water_ball 
           // create_new_ball([new_ball_array[i][0], row]);
           var new_ball_coords = [new_ball_array[i][0], row];
           var destroy_square_coords = [new_ball_array[i][1], row];
            // destroy the square at the second index of new_ball_array
    //        console.log("call new_ball at: ",new_ball_coords);
            create_new_ball(new_ball_coords);
       //     console.log("destroy square at: ", destroy_square_coords);
     //        scene.water_blocks[destroy_square_coords[0]][destroy_square_coords[1]].destroy();
              // set ref to 0
     //         scene.water_blocks[destroy_square_coords[0]][destroy_square_coords[1]] = 0;
      //        map[destroy_square_coords[0]][destroy_square_coords[1]] = 0;
        }
        
     //   console.log("water blocks: ", scene.water_blocks);
        
       }
       
       

    }

}



    // return an array with of tuples, first is coord of new ball to be created and second is square to be destroyed

function get_new_water_balls(row){
    var water_found = false;
    
    var return_array = [];
    
    //var water_stretches = [];
    //console.log(row)
    //increment thru each column in the array
    for (var i =0; i < COLS; i++){
        //get the value at that index
        var square = row[i];
        water_found = false;
        
        // if square is water
        
        if (square > 0){
            
            water_found = true;
            var left_open = false;
            var right_open = false;
            var highest_pressure_index =0;
            var highest_pressure = 1;
            var new_ball_coord;

        //    console.log("water found", i);
            
        //     // check the square before the water to see if it's open and save it's address
             if (row[i-1]==0){
                 left_open = i-1;
                // console.log("left_open: ", left_open);
             }
            
            // itarate thru row until you find the end of the water and save the location of the highest pressure
            while(water_found == true){
                if(row[i]>highest_pressure){
         //           console.log("highest_pressure set to: ", row[i] )
                    highest_pressure = row[i];
                    highest_pressure_index = i;
                }
                if (row[i]<1){
                    water_found = false;
                    if (row[i]==0){
                        right_open = i;
                    }
                }
                i++;
            }
            
            // only pop a ball out if there is an open space and pressure is greater than 1
         if (highest_pressure> 1){
            
            if(left_open || right_open){
                if (left_open && right_open){
                    var side = Math.floor(Math.random() * Math.floor(2));
                    if (side ==1){
                        new_ball_coord = right_open;
                    }
                    else{
                        new_ball_coord = left_open;
                    }
                }
                else if(left_open){
                    new_ball_coord = left_open;
                }
                else if( right_open){
                    new_ball_coord = right_open;
                }
            }
        
            return_array.push([new_ball_coord, highest_pressure_index]); 
         }
        }
    }
   //              console.log("return array: ", return_array);
   return return_array;
}


function move_water_block(coord){
    //console.log("water block drops");
    // console.log("destroy water at: ", coord);
    //console.log(scene.water_blocks[coord[0]][coord[1]]);
    
    // move the sprite down
    
    // get new pixel address
   var new_coords = get_pixel_coords(coord[0],coord[1]+1);
    
    //move object to new y coords
   scene.water_blocks[coord[0]][coord[1]].y= new_coords[1];

    // add a ref in the new location
    scene.water_blocks[coord[0]][coord[1]+1] = scene.water_blocks[coord[0]][coord[1]];
    
    // clear the ref of the block in the array
    scene.water_blocks[coord[0]][coord[1]] = 0;
    
    
    
}
function new_ball(){
 // console.log('new ball');
  // the scope is defined in the timed event callback scope
  
  // get a random x location in roughly the middle of the display
  //if (scene.drop_balls == true){
     var x = Math.random()*20;

//   // create a new ball with the image 'empty_ball_image'
    var ball = scene.matter.add.image(200+x,10, 'ball_image');
  //  var test_sqr = get_square_coords(ball.x, ball.y);
  //  console.log("square", test_sqr);
   // var test_pixel = get_pixel_coords(test_sqr[0], test_sqr[1]);
  //  console.log("pixel", test_pixel);
//     ball.name = 'ball';
     ball.setCircle;
     ball.setFriction(.01);
     ball.setFrictionAir(0)
    //ball.setDensity(.00000001);
     ball.setBounce(.88);
//     ball.setBlendMode('ADD');
    ball.setSleepEvents(true, true);
//     ball_group.add(ball);
    ball.setCollisionCategory(scene.water_collision_cat);
    ball.setCollidesWith(scene.water_collision_cat);
  //}
 }

function create_new_ball(coord){
    var pixel_coord = get_pixel_coords(coord[0], coord[1]);
    var ball = scene.matter.add.image(pixel_coord[0],pixel_coord[1], 'ball_image');
    ball.setCircle;
    ball.setFriction(.01);
    ball.setFrictionAir(0)
    //ball.setDensity(.00000001);
    ball.setBounce(.88);
//     ball.setBlendMode('ADD');
    ball.setSleepEvents(true, true);
//     ball_group.add(ball);
    ball.setCollisionCategory(scene.water_collision_cat);
    ball.setCollidesWith(scene.water_collision_cat);
}


// function set_water_block(ball){
//     var square_coords = get_square_coords(ball.x, ball.y);
//     console.log("create water_block at" ,square_coords)
    
// }


function get_square_coords(x, y){
    var col = Math.floor(x/COL_WIDTH);
    var row = Math.floor(y/ROW_HEIGHT);
    return([col, row]);

}

function get_pixel_coords(x,y){
    var px = (x * COL_WIDTH)+COL_WIDTH/2;
    var py = (y * ROW_HEIGHT)+ROW_HEIGHT/2;
    return [px,py];
}

//=========for each examples=============

//         scene.test_level_group.getChildren().forEach(function(block) {
//             block.setVelocityY(0)
//             block.setVelocityX(0)
//         }, this);


//     scene.test_level_group.children.each(function(block){
//         block.setVelocityY(-1)
//     },this)



//==============sleep events====================///////////

