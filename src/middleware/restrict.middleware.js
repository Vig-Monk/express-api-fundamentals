import { AppError} from "../utils/appError.js"
export const restrictTo = function(...role){
	return (req,res,next)=> {
		if (!role.includes(req.user.role)){
			next(new AppError("You do not have permission to perform this action",403))
		}
		next()
	}
}