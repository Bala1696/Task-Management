# TaskManagement


--------------------------------------------------------------------------------------------------------------------------
# COMMENT
http://localhost:1731/api/create-comment/?id
{
    params:task_id
    body:comments
    method:POST
}
http://localhost:1731/api/update-comment/?id
{
    params:comment_id
    body:comment
    method:PATCH
}
http://localhost:1731/api/delete-comment/?id
{
    params:comment_id
    method:DELETE
}
http://localhost:1731/api/get-comment/?id
{
    params:task_id
    method:GET
}
--------------------------------------------------------------------------------------------------------------------------
# LEAVE
http://localhost:1731/api/reset-leave
{
    body:casualLeave, sickLeave, permission
    method:POST
}
http://localhost:1731/api/apply-leave
{
    body:leaveType, startDate, endDate, startTime, endTime, reason, emergencyContact
    method:POST
}
http://localhost:1731/api/leave-request
{
    method:GET
}
http://localhost:1731/api/approve-leave/?id
{
    params:leave_id
    method:PATCH
}
--------------------------------------------------------------------------------------------------------------------------
# ORG
http://localhost:1731/api/create-org
{
    body:orgName, orgType, orgPrefix
    method:POST
}
http://localhost:1731/api/get-org
{
    method:GET
}
http://localhost:1731/api/update-org/?id
{
    params:org_id
    orgName, orgType, orgPrefix
}
http://localhost:1731/api/delete-org/?id
{
    params:org_id
}
--------------------------------------------------------------------------------------------------------------------------
# PROJECT
http://localhost:1731/api/create-project
{
    body:projectName
    method:POST
}
http://localhost:1731/api/get-all-project
{
    method:GET
}
http://localhost:1731/api/update-project/?id
{
    params:project_id
    body:projectName
    method:PATCH
}
http://localhost:1731/api/delete-project/?id
{
    params:project_id
    method:DELETE
}
http://localhost:1731/api/get-project/?id
{
    params:project_id
    method:GET
}
--------------------------------------------------------------------------------------------------------------------------
# TASK
http://localhost:1731/api/create-task/?id
{
    params:project_id
    body:taskTitle, taskType
    method:POST
}
http://localhost:1731/api/update-task/?id
{
    params:task_id
    body:taskTitle, description, notes, assigned, status, priority, releaseVersion, effortEstimation, parentTask
    method:PATCH
}
http://localhost:1731/api/delete-task/?id
{
    params:task_id
    method:DELETE
}
http://localhost:1731/api/task-pagination/?id
{
    params:project_id
    body:page, limit
    method:GET
}
http://localhost:1731/api/get-task/?id
{
    params:task_id
    method:GET
}
--------------------------------------------------------------------------------------------------------------------------
# TIMESHEET
http://localhost:1731/api/my-timesheet-data
{
    method:GET
}
http://localhost:1731/api/team-timesheet-data
{
    method:GET
}
--------------------------------------------------------------------------------------------------------------------------
# USER
http://localhost:1731/api/register
{
    body:name, username, password, email
    method:POST
}
http://localhost:1731/api/login
{
    body:identifier, password
    method:POST
}
http://localhost:1731/api/dp-upload
{
    method:PATCH
}
http://localhost:1731/api/get-dp
{
    method:GET
}
http://localhost:1731/api/reset-password
{
    body:token, password
    method:PATCH
}
http://localhost:1731/api/forgot-password
{
    body:email
    method:POST
}
http://localhost:1731/api/logout
{
    method:POST
}
http://localhost:1731/api/invite
{
    body:name, username, password, email
    method:POST
}
http://localhost:1731/api/verify-otp
{
    body:otp
    method:POST
}
http://localhost:1731/api/assign-reporting-person
{
    body:username, reportingPerson
    method:GET
}
--------------------------------------------------------------------------------------------------------------------------