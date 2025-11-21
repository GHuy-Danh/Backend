import { Injectable, NotFoundException,BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';

export type UserDto = Omit<User, 'mat_khau'> & { mat_khau?: string };

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async login(id: string, password: string) {
    console.log('>>> Kiểm tra người dùng:', id, password);

    // Tìm người dùng theo _id và mật khẩu
    const user = await this.userModel.findOne({ _id: id, mat_khau: password }).lean();

    if (!user) {
      console.log('>>> Không tìm thấy người dùng');
      return { success: false, message: 'Không tìm thấy người dùng' };
    }

    console.log('>>> Tìm thấy người dùng:', user.ho_ten, '| Loại:', user.loai);

    // Dữ liệu trả về cho frontend
    const userData: any = {
      _id: user._id,
      ho_ten: user.ho_ten,
      loai: user.loai,
      email: user.email,
    };

    switch (user.loai) {
      case 'Sinh viên':
        userData.ma_sv = user.ma_sv;
        userData.lop = user.lop;
        userData.khoa_hoc = user.khoa_hoc;
        userData.trang_thai = user.trang_thai;
        break;

      case 'Giảng viên':
        userData.ma_gv = user.ma_gv;
        userData.bo_mon = user.nganh_day;
        break;

      case 'Quản trị viên':
      case 'Admin':
      case 'Quản trị':
        userData.chuc_vu = user.chuc_vu;
        break;

      default:
        console.log('>>> Loại người dùng không xác định:', user.loai);
        return { success: false, message: 'Loại người dùng không xác định!' };
    }

    return {
      success: true,
      data: userData,
    };
  }
  // ----------------------------------------------------
// 🔹 CHỨC NĂNG QUẢN LÝ NGƯỜI DÙNG CHO ADMIN (CRUD)
// ----------------------------------------------------
  // 1. CREATE
  async create(userData: UserDto): Promise<User> {
        // ... (Logic kiểm tra và tạo mới)
        const newUser = new this.userModel(userData);
        return newUser.save();
  }

  async findAll(): Promise<User[]> {
    // 💡 FIX LỖI: Ép kiểu trung gian sang 'unknown'
    return this.userModel.find().select('-mat_khau').lean().exec() as unknown as Promise<User[]>; 
}

// 3. READ ONE (Lấy chi tiết)
async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).select('-mat_khau').lean().exec();
    if (!user) throw new NotFoundException(`Không tìm thấy người dùng với mã ${id}`);
    // 💡 FIX LỖI: Ép kiểu trung gian sang 'unknown'
    return user as unknown as User; 
}

  // 4. UPDATE (Dùng cho Admin hoặc updateProfile)
//   async update(id: string, userData: Partial<UserDto>): Promise<User> { 
//     // 💡 Nâng cấp: Lọc bỏ các trường không nên cập nhật nếu có
//     // Trong trường hợp này, `mat_khau` đã được Controller lọc. 
//     
//     const updatedUser = await this.userModel.findByIdAndUpdate(
//         id, 
//         { $set: userData }, // $set sẽ cập nhật đúng các trường có trong userData
//         { new: true, runValidators: true }
//     ).select('-mat_khau').exec();

//     if (!updatedUser) throw new NotFoundException(`Không tìm thấy người dùng với mã ${id} để cập nhật.`);
//     // 💡 Cải tiến: Dùng ép kiểu trung gian cho nhất quán
//     return updatedUser as unknown as User; 
// }

    async update(id: string, userData: Partial<UserDto>): Promise<User> {
      const cleanData = { ...userData };
      delete cleanData._id;
      delete cleanData.mat_khau;

      const updatedUser = await this.userModel
        .findByIdAndUpdate(id, { $set: cleanData }, { new: true })
        .select('-mat_khau')
        .lean();

      if (!updatedUser)
        throw new NotFoundException(`Không tìm thấy người dùng với mã ${id}`);

      return updatedUser as unknown as User;
  }

    
  // 5. DELETE
  async delete(id: string): Promise<{ deletedCount?: number }> {
        const result = await this.userModel.deleteOne({ _id: id }).exec();
        if (result.deletedCount === 0) throw new NotFoundException(`Không tìm thấy người dùng với mã ${id} để xóa.`);
        return result;
  }
    
  // 6. Đổi mật khẩu
  /** 🔹 Đổi mật khẩu có kiểm tra mật khẩu hiện tại */
  async changePassword(id: string, currentPassword: string, newPassword: string) {
    const user = await this.userModel.findById(id).lean();

    if (!user) {
      throw new NotFoundException(`Không tìm thấy người dùng với ID ${id}`);
    }

    // ✅ Kiểm tra mật khẩu hiện tại
    if (user.mat_khau !== currentPassword) {
      throw new BadRequestException('WRONG_PASSWORD');
    }

    // ✅ Cập nhật mật khẩu mới
    await this.userModel.updateOne({ _id: id }, { mat_khau: newPassword });

    return {
      success: true,
      message: 'Đổi mật khẩu thành công!',
    };
  }

  // ===============================================
  // 🔹 RESET PASSWORD VỀ "123" (Không cần mật khẩu cũ)
  // ===============================================
  async resetPassword(id: string) {
    const user = await this.userModel.findById(id).lean();

    if (!user) {
      throw new NotFoundException(`Không tìm thấy người dùng với ID ${id}`);
    }

    // 🔥 Reset trực tiếp về "123"
    await this.userModel.updateOne(
      { _id: id },
      { $set: { mat_khau: "123" } }
    );

    return {
      success: true,
      message: "Reset mật khẩu thành công!",
      newPassword: "123"
    };
  }

}
