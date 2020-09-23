import {Entity} from "./Entities";

export default class Graphics {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  // draw(entity: Entity) {
  //
  //   this.ctx.save();
  //   this.ctx.rotate(entity.rotation);
  //   this.ctx.drawImage(
  //     entity.drawImage.image,
  //     entity.drawImage.x,
  //     entity.drawImage.y,
  //     entity.drawImage.w,
  //     entity.drawImage.h,
  //     entity.x,
  //     entity.y,
  //     entity.width,
  //     entity.height
  //   );
  //   this.ctx.restore();
  // }
}
