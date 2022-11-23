
export default function Ghost(main) {

    
    for(var i=1;i<=4;i++){
        main.anims.create({
            key: 'ghost'+ i +'right',
            frames: main.anims.generateFrameNumbers('ghost'+i,{start:0, end:0}),
        
        });
        main.anims.create({
            key: 'ghost'+ i +'left',
            frames: main.anims.generateFrameNumbers('ghost'+i,{start:1, end:1}),
            frameRate:5,

        });
        main.anims.create({
            key: 'ghost'+ i +'down',
            frames: main.anims.generateFrameNumbers('ghost'+i,{start:2, end:2}),
            frameRate:5,

        });
        main.anims.create({
            key: 'ghost'+ i +'up',
            frames: main.anims.generateFrameNumbers('ghost'+i,{start:3, end:3}),
            frameRate:5,
        });
    }
}   
