import mongoose, { Document, model, Schema } from 'mongoose'
import scrypt from 'scryptsy'

const hashPassword = (password: string) =>
    scrypt(password, '$alt', 8192, 5, 1, 25).toString('base64')

mongoose.set('useCreateIndex', true)

export interface IUser extends Document {
    username: string
    email: string
    password: string
    profile: string
    point: number

    create(username: string, email: string, password: string, profile: string): void
    findOneByEmail(email: string): Promise<IUser>
    verify(password: string): boolean
    toUserResponse(): UserResponse
}

const UserSchema: Schema = new Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, trim: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    profile: { type: String, default: "" },
    point: { type: Number, default: 0 }
})

UserSchema.statics.create = function(username: string, email: string, password: string, profile: string) {
    const user = new this({
        username,
        email,
        password: hashPassword(password),
        profile
    })
    user.save()
}

UserSchema.statics.findOneByEmail = function(email: string) {
    return User.findOne({ email }).exec()
}

UserSchema.methods.verify = function(password: string) {
    return this.password === hashPassword(password)
}

UserSchema.methods.toUserResponse = function(): UserResponse {
    const user = this as IUser
    return {
        _id: user._id,
        username: user.username,
        email: user.email,
        profile: user.profile
    } as UserResponse
}

export const User = model<IUser>('User', UserSchema)

export interface UserResponse {
    _id: string
    username: string
    email: string
    profile: string
}
